const { createClient } = require("@supabase/supabase-js");

const supaBaseClient = {
  client: null,
};

function initSupaBaseClient() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      throw new Error("Supabase credentials missing. Check your .env file.");
    }

    supaBaseClient.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    console.log("✅ Supabase client initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing Supabase:", error);
    process.exit(1); // Stop the server if Supabase fails to initialize
  }
}

module.exports = { initSupaBaseClient, supaBaseClient };
