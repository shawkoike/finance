export default function Home() {
  const startCheckout = async () => {
    const res = await fetch("/api/create-checkout-session", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <main style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>サブスク申込</h1>
      <button onClick={startCheckout}>申し込む</button>
    </main>
  );
}
