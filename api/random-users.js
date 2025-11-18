export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const response = await fetch("https://randomuser.me/api/?results=5&nat=br");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
}
