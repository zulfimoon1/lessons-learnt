
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TranscriptionRequest {
  audio: string; // base64 encoded audio
  mimeType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, mimeType }: TranscriptionRequest = await req.json();
    
    if (!audio) {
      return new Response(
        JSON.stringify({ error: "No audio data provided" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // For now, return a placeholder transcription
    // In production, you would integrate with OpenAI Whisper or similar service
    const placeholderTranscription = "Audio transcription will be available soon. This is a placeholder for the voice note content.";

    console.log("Audio transcription requested, returning placeholder");

    return new Response(
      JSON.stringify({ 
        transcription: placeholderTranscription,
        success: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in transcribe-audio function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        transcription: "",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
