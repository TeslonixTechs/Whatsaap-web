import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCampaignRequest {
  campaignId: string;
}

const RATE_LIMIT_PER_MINUTE = 60; // WhatsApp Business API limit
const DELAY_MS = (60 * 1000) / RATE_LIMIT_PER_MINUTE; // ~1 second between messages

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { campaignId } = await req.json() as SendCampaignRequest;

    console.log('Starting campaign:', campaignId);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, assistants(phone_number)')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Update campaign status to sending
    await supabase
      .from('campaigns')
      .update({ 
        status: 'sending',
        started_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    // Get recipients based on segment or all conversations
    let recipientsQuery = supabase
      .from('conversations')
      .select('phone_number')
      .eq('assistant_id', campaign.assistant_id);

    if (campaign.segment_id) {
      const { data: segment } = await supabase
        .from('customer_segments')
        .select('filters')
        .eq('id', campaign.segment_id)
        .single();
      
      if (segment?.filters) {
        // Apply segment filters (simplified, expand as needed)
        const filters = segment.filters as any;
        if (filters.tags) {
          // Filter by tags if needed
        }
      }
    }

    const { data: recipients, error: recipientsError } = await recipientsQuery;

    if (recipientsError) {
      throw new Error('Failed to get recipients');
    }

    const uniquePhones = [...new Set(recipients?.map(r => r.phone_number) || [])];
    
    // Update total recipients
    await supabase
      .from('campaigns')
      .update({ total_recipients: uniquePhones.length })
      .eq('id', campaignId);

    console.log(`Sending to ${uniquePhones.length} recipients with rate limit ${RATE_LIMIT_PER_MINUTE}/min`);

    // Send messages with rate limiting
    let sentCount = 0;
    let failedCount = 0;

    for (const phone of uniquePhones) {
      try {
        // Check if campaign was paused/cancelled
        const { data: currentCampaign } = await supabase
          .from('campaigns')
          .select('status')
          .eq('id', campaignId)
          .single();

        if (currentCampaign?.status !== 'sending') {
          console.log('Campaign stopped by user');
          break;
        }

        // Log as queued
        const { data: logEntry } = await supabase
          .from('campaign_logs')
          .insert({
            campaign_id: campaignId,
            phone_number: phone,
            status: 'queued'
          })
          .select()
          .single();

        // TODO: Integrate with WhatsApp Business API
        // For now, simulate sending
        const success = Math.random() > 0.05; // 95% success rate simulation

        if (success) {
          await supabase
            .from('campaign_logs')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', logEntry.id);
          sentCount++;
        } else {
          await supabase
            .from('campaign_logs')
            .update({
              status: 'failed',
              error_message: 'Simulated failure'
            })
            .eq('id', logEntry.id);
          failedCount++;
        }

        // Update campaign progress
        await supabase
          .from('campaigns')
          .update({
            sent_count: sentCount,
            failed_count: failedCount
          })
          .eq('id', campaignId);

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));

      } catch (error) {
        console.error('Error sending to', phone, error);
        failedCount++;
      }
    }

    // Mark campaign as completed
    await supabase
      .from('campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount
      })
      .eq('id', campaignId);

    console.log(`Campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        totalRecipients: uniquePhones.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in send-campaign:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
