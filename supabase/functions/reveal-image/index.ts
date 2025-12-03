import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
    try {
        const { puzzleId, pieceId } = await req.json();

        // 1. Check if piece is minted
        const { data: mint, error } = await supabase
            .from("mints")
            .select("tx_hash")
            .eq("puzzle_id", puzzleId)
            .eq("piece_id", pieceId)
            .single();

        if (error || !mint) {
            return new Response(JSON.stringify({ error: "Piece not minted yet" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 2. Return Image URL (Signed URL or Public URL)
        // For this demo, we assume images are stored in a bucket 'puzzle-images'
        // Structure: puzzle_{id}/piece_{id}.png

        const { data } = supabase
            .storage
            .from('puzzle-images')
            .getPublicUrl(`puzzle_${puzzleId}/piece_${pieceId}.png`);

        return new Response(JSON.stringify({ imageUrl: data.publicUrl }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
