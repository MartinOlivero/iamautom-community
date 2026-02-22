const { createClient } = require('@supabase/supabase-js');
async function testLogin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, anonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'martin.olivero@gmail.com',
        password: 'pokoij'
    });

    if (error) {
        console.error("Login Error:", error.message);
    } else {
        console.log("Login Success! User:", data.user.email);

        // Also check the profile role
        const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profErr) {
            console.error("Profile Error:", profErr.message);
        } else {
            console.log("Profile role:", profile.role);
        }
    }
}
testLogin();
