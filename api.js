/*
* Ibrahim Hasaan 2023
* MIT License
*/

// TODO: transfer to typescipt or add function signatures
class RateMyProfessorAPI {
    constructor(name) {
        this.name = name;
        this.id = null; // for example, U2Nob29sLTE1MTM= for UMass Amherst
        this.legacyID = null; // for example, 1513 for UMass Amherst
    }

    async setID(name) {
        if (this.id && this.legacyID) return;
        
        if (!name) {
            name = this.name;
        }

        try {
            const body = "{\"query\":\"query NewSearchSchoolsQuery(\\n  $query: SchoolSearchQuery!\\n) {\\n  newSearch {\\n    schools(query: $query) {\\n      edges {\\n        cursor\\n        node {\\n          id\\n          legacyId\\n          name\\n          city\\n          state\\n          departments {\\n            id\\n            name\\n          }\\n          numRatings\\n          avgRatingRounded\\n          summary {\\n            campusCondition\\n            campusLocation\\n            careerOpportunities\\n            clubAndEventActivities\\n            foodQuality\\n            internetSpeed\\n            libraryCondition\\n            schoolReputation\\n            schoolSafety\\n            schoolSatisfaction\\n            socialActivities\\n          }\\n        }\\n      }\\n      pageInfo {\\n        hasNextPage\\n        endCursor\\n      }\\n    }\\n  }\\n}\\n\",\"variables\":{\"query\":{\"text\":\"" + name + "\"}}}";

            const node = await fetch("https://www.ratemyprofessors.com/graphql", {
                "headers": {
                  "authorization": "Basic dGVzdDp0ZXN0",
                  "Referer": "https://www.ratemyprofessors.com/",
                },
                "body": body,
                "method": "POST"
              })
              .then(response => response.json())
              .then(data => data.data.newSearch.schools.edges[0].node);

            this.legacyID = node.legacyID;
            this.id = node.id;
        } catch (error) {
            console.log("Oops, there's a problem in setting the school id!", error);
        }
    }

    async getID() {
        if (!this.id && !this.legacyID) {
            await this.setID();
        };

        return this.id;
    }

    async getNumberOfProfessors(id) {
        if (!this.id && !this.legacyID) {
            await this.setID();
        };

        if (!id) {
            id = this.id;
        }

        try {
            const referer = "https://www.ratemyprofessors.com/search/professors/" + this.legacyID + "?q=*";
            const body = "{\"query\":\"query TeacherSearchResultsPageQuery(\\n  $query: TeacherSearchQuery!\\n  $schoolID: ID\\n) {\\n  search: newSearch {\\n    ...TeacherSearchPagination_search_1ZLmLD\\n  }\\n  school: node(id: $schoolID) {\\n    __typename\\n    ... on School {\\n      name\\n    }\\n    id\\n  }\\n}\\n\\nfragment TeacherSearchPagination_search_1ZLmLD on newSearch {\\n  teachers(query: $query, first: 1, after: \\\"\\\") {\\n    didFallback\\n    edges {\\n      cursor\\n      node {\\n        ...TeacherCard_teacher\\n        id\\n        __typename\\n      }\\n    }\\n    pageInfo {\\n      hasNextPage\\n      endCursor\\n    }\\n    resultCount\\n    filters {\\n      field\\n      options {\\n        value\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment TeacherCard_teacher on Teacher {\\n  id\\n  legacyId\\n  avgRating\\n  numRatings\\n  ...CardFeedback_teacher\\n  ...CardSchool_teacher\\n  ...CardName_teacher\\n  ...TeacherBookmark_teacher\\n}\\n\\nfragment CardFeedback_teacher on Teacher {\\n  wouldTakeAgainPercent\\n  avgDifficulty\\n}\\n\\nfragment CardSchool_teacher on Teacher {\\n  department\\n  school {\\n    name\\n    id\\n  }\\n}\\n\\nfragment CardName_teacher on Teacher {\\n  firstName\\n  lastName\\n}\\n\\nfragment TeacherBookmark_teacher on Teacher {\\n  id\\n  isSaved\\n}\\n\",\"variables\":{\"query\":{\"text\":\"\",\"schoolID\":\"" + id + "\",\"fallback\":true,\"departmentID\":null},\"schoolID\":\"" + id + "\"}}";
            const response = await fetch("https://www.ratemyprofessors.com/graphql", { 
                "headers": {
                    "authorization": "Basic dGVzdDp0ZXN0",
                    "Referer": referer,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": body,
                "method": "POST"
            }).then(response => {
                if (!response.ok) {
                    throw new Error("Fetch response is not okay! Try checking your connection, url or running the program again!")
                }
                return response.json();
            });

            return await response.data.search.teachers.resultCount;
        } catch (error) {
            console.log("Oops, there's some problem in fetching the number of professors!", error);
        }
    }

    async getReviews(id) {
        if (!this.id && !this.legacyID) {
            await this.setID();
        };

        if (!id) {
            id = this.id;
        }

        try {
            const numRatings = await this.getNumberOfProfessors();
            const referer = "https://www.ratemyprofessors.com/search/professors/" + this.legacyID + "?q=*";
            const body = "{\"query\":\"query TeacherSearchResultsPageQuery(\\n  $query: TeacherSearchQuery!\\n  $schoolID: ID\\n) {\\n  search: newSearch {\\n    ...TeacherSearchPagination_search_1ZLmLD\\n  }\\n  school: node(id: $schoolID) {\\n    __typename\\n    ... on School {\\n      name\\n    }\\n    id\\n  }\\n}\\n\\nfragment TeacherSearchPagination_search_1ZLmLD on newSearch {\\n  teachers(query: $query, first:" + numRatings + ", after: \\\"\\\") {\\n    didFallback\\n    edges {\\n      cursor\\n      node {\\n        ...TeacherCard_teacher\\n        id\\n        __typename\\n      }\\n    }\\n    pageInfo {\\n      hasNextPage\\n      endCursor\\n    }\\n    resultCount\\n    filters {\\n      field\\n      options {\\n        value\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment TeacherCard_teacher on Teacher {\\n  id\\n  legacyId\\n  avgRating\\n  numRatings\\n  ...CardFeedback_teacher\\n  ...CardSchool_teacher\\n  ...CardName_teacher\\n  ...TeacherBookmark_teacher\\n}\\n\\nfragment CardFeedback_teacher on Teacher {\\n  wouldTakeAgainPercent\\n  avgDifficulty\\n}\\n\\nfragment CardSchool_teacher on Teacher {\\n  department\\n  school {\\n    name\\n    id\\n  }\\n}\\n\\nfragment CardName_teacher on Teacher {\\n  firstName\\n  lastName\\n}\\n\\nfragment TeacherBookmark_teacher on Teacher {\\n  id\\n  isSaved\\n}\\n\",\"variables\":{\"query\":{\"text\":\"\",\"schoolID\":\"" + id + "\",\"fallback\":true,\"departmentID\":null},\"schoolID\":\"" + id + "\"}}";

            const response = await fetch("https://www.ratemyprofessors.com/graphql", {
                "headers": {
                    "authorization": "Basic dGVzdDp0ZXN0",
                    "Referer": referer,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": body,
                "method": "POST"
            }).then(response => {
                if (!response.ok) {
                    throw new Error("Fetch response is not okay! Try checking your connection, url or running the program again!")
                }
                return response.json();
            });

            const teachers = response.data.search.teachers.edges.map(edge => edge.node);

            return teachers;
        } catch (error) {
            console.log("Oops, there's some problem in fetching the number of professors!", error);
        }
    }
}

class FileUtility {
    constructor() {
        this.fs = require('fs');
    }
    // writeToJSONFile(path: string, data: object | object[]): Promise<void>
    writeToJSONFile(path, data) {
        return this.fs.promises.writeFile(path, JSON.stringify(data));
    }

    // readFromJSONFile(path: string): Promise<object | object[]>
    readFromJSONFile(path) {
        return this.fs.promises.readFile(path).then(jsonData => JSON.parse(jsonData));
    }
}

// Example Run:
 
let api = new RateMyProfessorAPI("University of Massachusetts Amherst")

api.getReviews()
.then(reviews => {
    let file = new FileUtility();
    file.writeToJSONFile("professorsJSON.json", reviews);
})