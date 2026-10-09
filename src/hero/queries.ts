export const GET_PROJECT_MATCHES = `
  query GetProjectMatches($statuses: [Int!], $first: Int, $offset: Int) {
    project_matches(
      statuses: $statuses
      orderBy: "id"
      first: $first
      offset: $offset
    ) {
      id
      project_nr
      name
      custom_fields_searchable {
        values
      }
      
      measure {
        short
        name
      }

      customer {
        id
        first_name
        last_name
        email
      }

      contact {
        id
        first_name
        last_name
        email
      }

      address {
        street
        city
        zipcode
      }

      current_project_match_status {
        status_code
        name
      }
    }
  }
`;

export const GET_PROJECT_DETAILS = `
  query GetProjectDetails($ids: [Int]) {
    project_matches(ids: $ids) {
      id
      name
      project_nr
      custom_fields_searchable {
        values
      }

      address {
        full_address
      }

      contact {
        full_name

        address {
          full_address
        }

        email
        phone_home_formatted
        phone_mobile_formatted
      }

      current_project_match_status {
        status_code
        name
      }

      customer_documents {
        type
        nr
        value
        created
        vat

        file_upload {
          filename
          url_download
        }
      }

      histories {
        custom_title
        custom_text
        created
      }
    }
  }
`;

export const GLOBAL_SEARCH = `
  query GlobalSearch($term: String!, $category: SearchCategoryEnum, $first: Int, $offset: Int) {
    global_search(
      term: $term
      category: $category
      first: $first
      offset: $offset
    ) {
      __typename

      ... on ProjectMatch {
        id
        name
        project_nr

        address {
          full_address
        }

        contact {
          full_name

          address {
            full_address
          }

          email
          phone_home_formatted
          phone_mobile_formatted
        }

        current_project_match_status {
          status_code
          name
        }

        customer_documents {
          type
          nr
          value
          created
          vat

          file_upload {
            filename
            url_download
          }
        }

        histories {
          custom_title
          custom_text
          created
        }
      }

      ... on Customer {
        id
        first_name
        last_name
        email
      }

      ... on CustomerDocument {
        id
        nr
        type
        value
        created

        file_upload {
          filename
          url_download
        }
      }
    }
  }
`;