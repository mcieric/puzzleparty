import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ethers } from "https://esm.sh/ethers@5.7.2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const PUZZLE_MANAGER_ABI = [
    "event PieceMinted(uint256 indexed puzzleId, uint256 indexed pieceId, address indexed minter)"
];

serve(async (req) => {
    try {
        const { record } = await req.json(); // Payload from Supabase Database Webhook or Alchemy Webhook

        // Note: This example assumes we receive a webhook from Alchemy/QuickNode when an event occurs.
        // Alternatively, this function could be called by a cron job to index events.
        // For this implementation, we'll assume a direct call with event data for simplicity.

        const { puzzleId, pieceId, minter, txHash } = record;

        if (!puzzleId || !minter) {
            return new Response("Invalid payload", { status: 400 });
        }

        // 1. Insert into Mints table
        const { error: mintError } = await supabase
            .from("mints")
            .insert({
                tx_hash: txHash,
                puzzle_id: puzzleId,
                piece_id: pieceId,
                minter_address: minter,
                // user_fid: resolveFidFromAddress(minter) // Need a way to map Address -> FID
            });

        if (mintError) throw mintError;

        // 2. Update User XP
        // Simple logic: +10 XP per mint
        // In a real app, we'd look up the user by address first
        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("wallet_address", minter)
            .single();

        if (user) {
            await supabase
                .from("users")
                .update({ xp: user.xp + 10 })
                .eq("fid", user.fid);

            await supabase.from("xp_history").insert({
                user_fid: user.fid,
                amount: 10,
                reason: "mint_piece"
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
