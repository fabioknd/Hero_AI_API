import { GraphQLClient } from "graphql-request";
import { config } from "../config.js";
import { ACTIVE_PROJECT_STATUSES } from "./constants.js";
import { GET_PROJECT_MATCHES, GET_PROJECT_DETAILS, GLOBAL_SEARCH } from "./queries.js";
import { ADD_PROJECT_LOG } from "./mutations.js";

export const heroClient = new GraphQLClient(config.heroGraphqlUrl!, {
  headers: {
    Authorization: `Bearer ${config.heroApiKey}`,
  },
});

export async function heroQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return heroClient.request<T>(query, variables);
}

export type HeroProjectMatch = {
  id: number;
  project_nr: string;

  measure?: {
    short?: string;
    name?: string;
  };

  customer?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
  };

  contact?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
  };

  address?: {
    street?: string;
    city?: string;
    zipcode?: string;
  };

  current_project_match_status?: {
    status_code?: number;
    name?: string;
  };
};

export type HeroProjectDetails = {
  id: number;
  name?: string;
  project_nr?: string;

  address?: {
    full_address?: string;
  };

  contact?: {
    full_name?: string;
    address?: {
      full_address?: string;
    };
    email?: string;
    phone_home_formatted?: string;
    phone_mobile_formatted?: string;
  };

  current_project_match_status?: {
    status_code?: number;
    name?: string;
  };

  customer_documents?: {
    type?: string;
    nr?: string;
    value?: number;
    created?: string;
    vat?: number;
    file_upload?: {
      filename?: string;
      url_download?: string;
    };
  }[];

  histories?: {
    custom_title?: string;
    custom_text?: string;
    created?: string;
  }[];
};

type GetProjectMatchesResponse = {
  project_matches: HeroProjectMatch[];
};

type GetProjectDetailsResponse = {
  project_matches: HeroProjectDetails[];
};

export async function getActiveProjects(options?: {
  first?: number;
  offset?: number;
}) {
  const data = await heroQuery<GetProjectMatchesResponse>(GET_PROJECT_MATCHES, {
    statuses: ACTIVE_PROJECT_STATUSES,
    first: options?.first ?? 100,
    offset: options?.offset ?? 0,
  });

  return data.project_matches;
}

export async function getProjectDetails(projectId: number) {
  const data = await heroQuery<GetProjectDetailsResponse>(GET_PROJECT_DETAILS, {
    ids: [projectId],
  });

  return data.project_matches?.[0] ?? null;
}

export type HeroGlobalSearchResult = {
  __typename: string;
  id?: number;
  name?: string;
  project_nr?: string;

  address?: {
    full_address?: string;
  };

  contact?: {
    full_name?: string;
    address?: {
      full_address?: string;
    };
    email?: string;
    phone_home_formatted?: string;
    phone_mobile_formatted?: string;
  };

  current_project_match_status?: {
    status_code?: number;
    name?: string;
  };

  customer_documents?: HeroProjectDetails["customer_documents"];
  histories?: HeroProjectDetails["histories"];

  first_name?: string;
  last_name?: string;
  email?: string;

  nr?: string;
  type?: string;
  value?: number;
  created?: string;
  file_upload?: {
    filename?: string;
    url_download?: string;
  };
};

type GlobalSearchResponse = {
  global_search: HeroGlobalSearchResult[];
};

export async function globalSearch(options: {
  term: string;
  category?: "project_matches" | "contacts" | "documents" | "jobs" | "partners";
  first?: number;
  offset?: number;
}) {
  const data = await heroQuery<GlobalSearchResponse>(GLOBAL_SEARCH, {
    term: options.term,
    category: options.category ?? "project_matches",
    first: options.first ?? 10,
    offset: options.offset ?? 0,
  });

  return data.global_search;
}

type AddProjectLogResponse = {
  add_logbook_entry: {
    id: number;
  };
};

export async function addProjectLog(
  projectId: number,
  text: string
) {
  const data = await heroQuery<AddProjectLogResponse>(
    ADD_PROJECT_LOG,
    {
      targetId: projectId,
      text,
    }
  );

  return data.add_logbook_entry;
}