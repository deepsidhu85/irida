package ca.corefacility.bioinformatics.irida.web.controller.test.integration;


import com.google.common.net.HttpHeaders;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

import static com.jayway.restassured.RestAssured.*;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.hasItems;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Integration tests for projects.
 *
 * @author Franklin Bristow <franklin.bristow@phac-aspc.gc.ca>
 */
public class ProjectIntegrationTest {

    private static final String USERNAME = "fbristow";
    private static final String PASSWORD = "password1";

    @Before
    public void setUp() {
        RestAssured.authentication = preemptive().basic(USERNAME, PASSWORD);
        RestAssured.requestContentType(ContentType.JSON);
    }

    /**
     * If I try to issue a create request for an object with an invalid field name, the server should respond with 400.
     */
    @Test
    public void testCreateProjectBadFieldName() {
        Response r = given().body("{ \"projectName\": \"some stupid project\" }").
                expect().response().statusCode(HttpStatus.BAD_REQUEST.value()).when().post("/projects");
        assertTrue(r.getBody().asString().contains("Unrecognized property [projectName]"));
    }

    /**
     * Field names should be quoted. We should handle that failure gracefully.
     */
    @Test
    public void testCreateProjectNoQuotes() {
        Response r = given().body("{ name: \"some stupid project\" }").
                expect().response().statusCode(HttpStatus.BAD_REQUEST.value()).when().post("/projects");
        assertTrue(r.getBody().asString().contains("double quotes"));
    }

    @Test
    public void testCreateProject() {
        Map<String, String> project = new HashMap<>();
        project.put("name", "new project");

        Response r = given().body(project).expect().response()
                .statusCode(HttpStatus.CREATED.value()).when().post("/projects");
        String location = r.getHeader(HttpHeaders.LOCATION);
        assertNotNull(location);
        assertTrue(location.startsWith("http://localhost:8080/api/projects/"));
    }

    @Test
    public void testGetProject() {
        Map<String, String> project = new HashMap<>();
        String projectName = "new project";
        project.put("name", projectName);
        Response r = given().body(project).post("/projects");
        String location = r.getHeader(HttpHeaders.LOCATION);
        expect().body("resource.name", equalTo(projectName)).and()
                .body("resource.links.rel", hasItems("self", "project/users", "project/samples", "project/sequenceFiles"))
                .when().get(location);
    }

    @Test
    public void testUpdateProjectName() {
        Map<String, String> project = new HashMap<>();
        String projectName = "new project";
        String updatedName = "updated new project";
        project.put("name", projectName);
        Response r = given().body(project).post("/projects");
        String location = r.getHeader(HttpHeaders.LOCATION);
        project.put("name", updatedName);
        given().body(project).expect().statusCode(HttpStatus.OK.value()).when().patch(location);
        expect().body("resource.name", equalTo(updatedName)).when().get(location);
    }
}
