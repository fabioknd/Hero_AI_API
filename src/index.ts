import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { config } from "./config.js";
import { registerProjectTools } from "./tools/projects.js";
import { getActiveProjects, getProjectDetails, globalSearch, addProjectLog } from "./hero/client.js";
import { readHeroPdfDocumentText } from "./hero/documents.js";

function createMcpServer() {
  const server = new McpServer({
    name: "hero-ai-api",
    version: "1.0.0",
  });

  registerProjectTools(server);

  return server; 
}

const app = express();

app.use(cors());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "hero-ai-api",
  });
});

app.get("/hero/projects", async (_req, res) => {
  const projects = await getActiveProjects({
    first: 100,
    offset: 0,
  });

  res.json({
    count: projects.length,
    project_matches: projects,
  });
});

app.get("/hero/projects/:id", async (req, res) => {
  const projectId = Number(req.params.id);

  if (!Number.isInteger(projectId)) {
    return res.status(400).json({
      error: "Ungültige Projekt-ID",
    });
  }

  const project = await getProjectDetails(projectId);

  if (!project) {
    return res.status(404).json({
      error: "Projekt nicht gefunden",
    });
  }

  return res.json(project);
});

app.get("/hero/document-text", async (req, res) => {
  try {
    const url = String(req.query.url ?? "");

    if (!url) {
      return res.status(400).json({
        error: "Query-Parameter url fehlt.",
      });
    }

    const result = await readHeroPdfDocumentText(url);

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
});

app.get("/hero/search", async (req, res) => {
  try {
    const term = String(req.query.term ?? "");

    if (!term) {
      return res.status(400).json({
        error: "Query-Parameter 'term' fehlt.",
      });
    }

    const category = req.query.category
      ? String(req.query.category)
      : "project_matches";

    const first = Number(req.query.first ?? 10);
    const offset = Number(req.query.offset ?? 0);

    const results = await globalSearch({
      term,
      category: category as any,
      first,
      offset,
    });

    return res.json(results);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
});

app.post("/hero/project-log", async (req, res) => {

  const {
    projectId,
    text,
  } = req.body as {
    projectId: number;
    text: string;
  };

  const result =
    await addProjectLog(projectId, text);

  res.json(result);
});

app.post("/mcp", express.json(), async (req, res) => {
  const server = createMcpServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req, res) => {
  res.status(405).json({
    error: "MCP endpoint expects POST requests",
  });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Server listening on port ${config.port}`);
});