import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waqsogjkovolkxnpkkdp.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcXNvZ2prb3ZvbGt4bnBra2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMTg3MjIsImV4cCI6MjA5OTY5NDcyMn0.9wKJ8BTH2yqAUi2DtOa2HzFFQjaRLv5aqaY0XeZzT3Y';

  const diagnostics: Record<string, any> = {
    hasUrl: Boolean(url),
    urlValue: url,
    hasKey: Boolean(key),
    keyPrefix: key.slice(0, 15) + '...',
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    const supabase = createClient(url, key);

    // 1. Test Profiles
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    diagnostics.tests.profiles = { count: profiles?.length ?? 0, error: pError?.message || null, rows: profiles || [] };

    // 2. Test Family Groups
    const { data: groups, error: gError } = await supabase.from('family_groups').select('*');
    diagnostics.tests.family_groups = { count: groups?.length ?? 0, error: gError?.message || null, rows: groups || [] };

    // 3. Test Group Invitations
    const { data: invites, error: iError } = await supabase.from('group_invitations').select('*');
    diagnostics.tests.group_invitations = { count: invites?.length ?? 0, error: iError?.message || null, rows: invites || [] };

    // 4. Test Recipes
    const { data: recipes, error: rError } = await supabase.from('recipes').select('*').limit(5);
    diagnostics.tests.recipes = { count: recipes?.length ?? 0, error: rError?.message || null, sample: recipes?.[0] || null };

    // 5. Test Meal Planner
    const { data: meals, error: mError } = await supabase.from('meal_planner').select('*').limit(10);
    diagnostics.tests.meal_planner = { count: meals?.length ?? 0, error: mError?.message || null, rows: meals || [] };

    // 6. Test Write Capability (Insert & Delete a temporary ping row)
    const testPingId = 'ping_' + Date.now();
    const { error: insertError } = await supabase.from('tasks').insert([{
      id: testPingId,
      item_type: 'task',
      title: 'Diagnostic Test Ping',
      category: 'test',
      completed: true,
      created_at: new Date().toISOString()
    }]);

    if (insertError) {
      diagnostics.tests.write_test = { success: false, error: insertError.message };
    } else {
      await supabase.from('tasks').delete().eq('id', testPingId);
      diagnostics.tests.write_test = { success: true, message: 'Read/Write to Supabase works perfectly!' };
    }

    const hasAnyError = Object.values(diagnostics.tests).some((t: any) => t.error);

    return NextResponse.json({
      status: hasAnyError ? 'partial_error' : 'healthy_and_synced',
      diagnostics
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'fatal_error',
      error: err?.message || String(err),
      diagnostics
    }, { status: 500 });
  }
}

