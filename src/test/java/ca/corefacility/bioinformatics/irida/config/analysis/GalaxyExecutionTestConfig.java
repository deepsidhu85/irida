package ca.corefacility.bioinformatics.irida.config.analysis;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;

import ca.corefacility.bioinformatics.irida.config.conditions.NonWindowsPlatformCondition;
import ca.corefacility.bioinformatics.irida.pipeline.upload.galaxy.GalaxyHistoriesService;
import ca.corefacility.bioinformatics.irida.pipeline.upload.galaxy.GalaxyJobErrorsService;
import ca.corefacility.bioinformatics.irida.pipeline.upload.galaxy.GalaxyLibrariesService;
import ca.corefacility.bioinformatics.irida.pipeline.upload.galaxy.GalaxyWorkflowService;
import ca.corefacility.bioinformatics.irida.pipeline.upload.galaxy.integration.LocalGalaxy;
import ca.corefacility.bioinformatics.irida.repositories.filesystem.IridaFileStorageUtility;

import com.github.jmchilton.blend4j.galaxy.*;

/**
 * Test configuration for Galaxy execution services.
 */
@Configuration
@Profile("test")
@Conditional(NonWindowsPlatformCondition.class)
public class GalaxyExecutionTestConfig {

	@Autowired
	private LocalGalaxy localGalaxy;

	@Autowired
	private IridaFileStorageUtility iridaFileStorageUtility;

	/**
	 * Timeout in seconds to stop polling a Galaxy library.
	 */
	private static final int LIBRARY_TIMEOUT = 5 * 60;

	/**
	 * Polling time in seconds to poll a Galaxy library to check if datasets
	 * have been properly uploaded.
	 */
	private static final int LIBRARY_POLLING_TIME = 5;

	@Lazy
	@Bean
	public GalaxyInstance galaxyInstance() {
		return localGalaxy.getGalaxyInstanceAdmin();
	}

	@Lazy
	@Bean
	public GalaxyHistoriesService galaxyHistoriesService() {
		HistoriesClient historiesClient = localGalaxy.getGalaxyInstanceAdmin().getHistoriesClient();
		ToolsClient toolsClient = localGalaxy.getGalaxyInstanceAdmin().getToolsClient();
		return new GalaxyHistoriesService(historiesClient, toolsClient, galaxyLibrariesService(), iridaFileStorageUtility);
	}

	@Lazy
	@Bean
	public GalaxyLibrariesService galaxyLibrariesService() {
		LibrariesClient librariesClient = localGalaxy.getGalaxyInstanceAdmin().getLibrariesClient();
		return new GalaxyLibrariesService(librariesClient, LIBRARY_POLLING_TIME, LIBRARY_TIMEOUT, 1);
	}
	
	@Lazy
	@Bean
	public GalaxyWorkflowService galaxyWorkflowService() {
		WorkflowsClient workflowsClient = localGalaxy.getGalaxyInstanceAdmin().getWorkflowsClient();

		return new GalaxyWorkflowService(workflowsClient, StandardCharsets.UTF_8);
	}

	@Lazy
	@Bean
	public GalaxyJobErrorsService galaxyJobErrorsService() {
		GalaxyInstance galaxyInstance = localGalaxy.getGalaxyInstanceAdmin();
		return new GalaxyJobErrorsService(
				galaxyInstance.getHistoriesClient(),
				galaxyInstance.getToolsClient(),
				galaxyInstance.getJobsClient());
	}
}
