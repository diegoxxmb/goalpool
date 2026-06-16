export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const first_name = String(formData.get("first_name") ?? "");
  const last_name = String(formData.get("last_name") ?? "");
  const alias = String(formData.get("alias") ?? "");
  const phone = String(formData.get("phone") ?? "");

  const supabase = await createClient();

  const result = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name,
      last_name,
      alias,
      phone,
    },
  },
});

const error = result.error;
const data = result.data;

console.log("SIGNUP RESULT:", result);

  // 🔥 IMPORTANTE: manejar error correctamente
  if (error) {
    console.log("SIGNUP ERROR:", error.message);
    return redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.user) {
    return redirect(`/register?error=no_user_created`);
  }

  // ✅ SOLO si todo salió bien
  return redirect("/payment");
}
