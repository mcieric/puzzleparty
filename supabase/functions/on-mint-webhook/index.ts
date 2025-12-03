import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
    try {
        const { record } = await req.json();
        const { puzzleId, pieceId, minter, txHash } = record;

        if (!puzzleId || !minter) {
            return new Response("Invalid payload", { status: 400 });
        }

        // 1. Find or Create User
        let { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("wallet_address", minter)
            .single();

        if (!user) {
            const { data: newUser, error: createError } = await supabase
                .from("users")
                .insert({ wallet_address: minter, xp: 0 })
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;
        }

        // 2. Insert into Mints table (Idempotency check)
        const { error: mintError } = await supabase
            .from("mints")
            .insert({
                tx_hash: txHash,
                puzzle_id: puzzleId,
                piece_id: pieceId,
                minter_address: minter,
                user_id: user.id
            });

        if (mintError) {
            if (mintError.code === '23505') { // Unique violation
                return new Response(JSON.stringify({ message: "Already processed" }), { status: 200 });
            }
            throw mintError;
        }

        const XP_AMOUNT = 10;

        // 3. Update Global User XP
        await supabase
            .from("users")
            .update({ xp: (user.xp || 0) + XP_AMOUNT })
            .eq("id", user.id);

        // 4. Log History
        await supabase.from("xp_history").insert({
            user_id: user.id,
            amount: XP_AMOUNT,
            reason: "mint_piece"
        });

        // --- V11 NEW LOGIC ---

        // 5. Update Season XP
        // Fetch active season
        const { data: activeSeason } = await supabase
            .from("seasons")
            .select("id")
            .eq("is_active", true)
            .single();

        if (activeSeason) {
            // Check if user has season_xp entry
            const { data: seasonXp } = await supabase
                .from("season_xp")
                .select("xp_amount")
                .eq("season_id", activeSeason.id)
                .eq("user_id", user.id)
                .single();

            const currentSeasonXp = seasonXp ? seasonXp.xp_amount : 0;

            await supabase
                .from("season_xp")
                .upsert({
                    season_id: activeSeason.id,
                    user_id: user.id,
                    xp_amount: currentSeasonXp + XP_AMOUNT,
                    updated_at: new Date().toISOString()
                });
        }

        // 6. Update Monthly Events & Tiers
        const now = new Date();
        const monthDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]; // YYYY-MM-01

        const { data: monthlyEvent } = await supabase
            .from("monthly_events")
            .select("xp_gained, tier")
            .eq("month_date", monthDate)
            .eq("user_id", user.id)
            .single();

        const currentMonthlyXp = monthlyEvent ? monthlyEvent.xp_gained : 0;
        const newMonthlyXp = currentMonthlyXp + XP_AMOUNT;

        // Calculate Tier
        let newTier = 'Bronze';
        if (newMonthlyXp >= 1500) newTier = 'Diamond';
        else if (newMonthlyXp >= 500) newTier = 'Gold';
        else if (newMonthlyXp >= 100) newTier = 'Silver';

        await supabase
            .from("monthly_events")
            .upsert({
                month_date: monthDate,
                user_id: user.id,
                xp_gained: newMonthlyXp,
                tier: newTier,
                updated_at: new Date().toISOString()
            });

        // 7. Mystery Box Drop (5% chance)
        const isLucky = Math.random() < 0.05;
        if (isLucky) {
            // Determine box type
            const roll = Math.random();
            let boxType = 'Common';
            if (roll < 0.05) boxType = 'Legendary'; // 5% of drops
            else if (roll < 0.20) boxType = 'Epic'; // 15% of drops
            else if (roll < 0.50) boxType = 'Rare'; // 30% of drops
            // else Common (50% of drops)

            await supabase
                .from("mystery_boxes")
                .insert({
                    user_id: user.id,
                    box_type: boxType,
                    status: 'locked',
                    created_at: new Date().toISOString()
                });
        }

        // 8. Badge Checks
        // Check for 'first_mint'
        const { count: mintCount } = await supabase
            .from("mints")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id);

        if (mintCount === 1) {
            // Unlock 'first_mint' badge
            await supabase
                .from("user_badges")
                .upsert({
                    user_id: user.id,
                    badge_id: 'first_mint',
                    earned_at: new Date().toISOString()
                }, { onConflict: 'user_id, badge_id' });
        }

        return new Response(JSON.stringify({ success: true, mysteryBox: isLucky }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
