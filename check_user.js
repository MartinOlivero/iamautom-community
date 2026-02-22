const { createClient } = require('@supabase/supabase-js');
async function checkUser() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseSecretKey);

    const { data, error } = await supabase.auth.admin.listUsers();
    const user = data.users.find(u => u.email === 'martin.olivero@gmail.com');
    console.log("Email confirmed at:", user.email_confirmed_at);

    if (!user.email_confirmed_at) {
        console.log("Confirming email...");
        await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
        console.log("Done");
    }
}
checkUser();
