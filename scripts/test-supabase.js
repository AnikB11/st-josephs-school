const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars! Make sure to pass --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing Supabase connection with url:", supabaseUrl);
  
  const { data, error } = await supabase.from("website_content").select("*").limit(2);
  if (error) {
    console.error("Error fetching from website_content:", error);
  } else {
    console.log("Success! Data fetched:", data);
  }

  console.log("Testing auth connection...");
  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error("Auth error:", authError);
  } else {
    console.log("Auth success! Session:", authData);
  }
}

test().catch(console.error);
