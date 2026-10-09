import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    getActiveProjects,
    getProjectDetails,
    globalSearch,
    addProjectLog,
} from "../hero/client.js"; import { readHeroPdfDocumentText } from "../hero/documents.js";

export function registerProjectTools(server: McpServer) {
    server.tool(
        "hero_get_active_projects",
        "Liest aktive HERO-Projekte aus. Abgeschlossene Projekte mit status_code 2000 werden bereits in der HERO-Query ausgeschlossen. Das Feld 'volume' sagt, wie viel Rohertrag bei dem Projekt hängen bleiben - wenn das Feld ungleich 0 ist, ist das für das controlling wichtig.",
        {
            limit: z.number().min(1).max(100).default(20),
            offset: z.number().min(0).default(0),
        },
        async ({ limit, offset }) => {
            const projects = await getActiveProjects({
                first: limit,
                offset,
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(projects, null, 2),
                    },
                ],
            };
        }
    );

    server.tool(
        "hero_get_project_details",
        "Liest Details zu einem HERO-Projekt anhand der Projekt-ID aus, inklusive Adresse, Ansprechpartner, Dokumente, Download-URLs und Historie.",
        {
            projectId: z.number().int().positive(),
        },
        async ({ projectId }) => {
            const project = await getProjectDetails(projectId);

            if (!project) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Kein Projekt mit ID ${projectId} gefunden.`,
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(project, null, 2),
                    },
                ],
            };
        }
    );

    server.tool(
        "hero_read_document_pdf",
        "Lädt eine HERO-PDF-Dokument-URL mit dem HERO-Bearer-Token und extrahiert den lesbaren Text aus der PDF.",
        {
            url: z.string().url(),
        },
        async ({ url }) => {
            const result = await readHeroPdfDocumentText(url);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
    );

    server.tool(
        "hero_global_search",
        "Durchsucht HERO global nach Projekten, Kunden und Dokumenten. Gut geeignet, um Projekte per Name, Adresse, Projektnummer oder Kundennamen zu finden.",
        {
            term: z.string().min(1),
            category: z
                .enum(["project_matches", "contacts", "documents", "jobs", "partners"])
                .optional()
                .default("project_matches"),
            limit: z.number().min(1).max(20).default(10),
            offset: z.number().min(0).default(0),
        },
        async ({ term, category, limit, offset }) => {
            const results = await globalSearch({
                term,
                category,
                first: limit,
                offset,
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2),
                    },
                ],
            };
        }
    );

    server.tool(
        "hero_add_project_log",
        "Fügt einem HERO-Projekt einen neuen Logbucheintrag hinzu.",
        {
            projectId: z.number().int().positive(),

            text: z
                .string()
                .min(1)
                .max(5000)
                .describe("Der Text, der im Projektlogbuch gespeichert werden soll."),
        },

        async ({ projectId, text }) => {
            const result = await addProjectLog(
                projectId,
                text
            );

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            {
                                success: true,
                                logbookEntryId: result.id,
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    );
}