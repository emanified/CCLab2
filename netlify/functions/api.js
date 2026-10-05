const { createClient } = require("@supabase/supabase-js");

const getSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  },
  body: JSON.stringify(body)
});

const proxyToBackend = async (event, path) => {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return jsonResponse(500, {
      error: "BACKEND_URL is not set. Add it in Netlify environment variables or set SUPABASE_URL/SUPABASE_KEY."
    });
  }

  const response = await fetch(`${backendUrl}${path}`, {
    method: event.httpMethod,
    headers: {
      "Content-Type": "application/json",
      ...(event.headers || {})
    },
    body: event.httpMethod === "GET" || event.httpMethod === "HEAD" ? undefined : event.body
  });

  const text = await response.text();

  return {
    statusCode: response.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    },
    body: text
  };
};

exports.handler = async (event) => {
  const method = event.httpMethod || "GET";

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: ""
    };
  }

  const rawPath = event.path || "/";
  const normalizedPath = rawPath.includes("/.netlify/functions/api")
    ? rawPath.replace(/^.*?\/api/, "/api")
    : rawPath;

  const route = normalizedPath.startsWith("/api") ? normalizedPath : `/api${normalizedPath}`;

  if (process.env.BACKEND_URL) {
    return proxyToBackend(event, route);
  }

  const supabase = getSupabase();

  if (!supabase) {
    return jsonResponse(500, {
      error: "Missing environment variables. Add SUPABASE_URL and SUPABASE_KEY in Netlify, or configure BACKEND_URL."
    });
  }

  if (route !== "/api/students") {
    return jsonResponse(404, { error: "Route not found" });
  }

  try {
    if (method === "GET") {
      const { data, error } = await supabase.from("students").select("*");

      if (error) {
        return jsonResponse(500, { error: error.message });
      }

      return jsonResponse(200, data);
    }

    if (method === "POST") {
      const body = event.body ? JSON.parse(event.body) : {};
      const { name, email, department, semester } = body;

      if (!name || !email) {
        return jsonResponse(400, { error: "Name and email are required." });
      }

      const { data, error } = await supabase
        .from("students")
        .insert([{ name, email, department, semester }])
        .select();

      if (error) {
        return jsonResponse(500, { error: error.message });
      }

      return jsonResponse(201, {
        message: "Student added successfully",
        id: data[0]?.id
      });
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (error) {
    return jsonResponse(500, { error: error.message });
  }
};
