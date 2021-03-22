package ca.corefacility.bioinformatics.irida.ria.unit.web.services;

import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.context.MessageSource;

import ca.corefacility.bioinformatics.irida.model.joins.impl.ProjectMetadataTemplateJoin;
import ca.corefacility.bioinformatics.irida.model.project.Project;
import ca.corefacility.bioinformatics.irida.model.sample.MetadataTemplate;
import ca.corefacility.bioinformatics.irida.model.sample.MetadataTemplateField;
import ca.corefacility.bioinformatics.irida.ria.web.services.UIMetadataService;
import ca.corefacility.bioinformatics.irida.service.ProjectService;
import ca.corefacility.bioinformatics.irida.service.sample.MetadataTemplateService;

import com.google.common.collect.ImmutableList;

import static org.mockito.Mockito.*;

public class UIMetadataServiceTest {
	private final Long PROJECT_ID = 1L;
	private final String TEMPLATE_NAME = "TEST TEMPLATE 01";
	private final Long NEW_TEMPLATE_ID = 2L;
	private final Project project = new Project();
	private final MetadataTemplate template = new MetadataTemplate();
	private ProjectService projectService;
	private MetadataTemplateService templateService;
	private MessageSource messageSource;
	private UIMetadataService service;

	@Before
	public void setup() {
		this.projectService = Mockito.mock(ProjectService.class);
		this.templateService = Mockito.mock(MetadataTemplateService.class);
		this.messageSource = Mockito.mock(MessageSource.class);
		this.service = new UIMetadataService(projectService, templateService, messageSource);

		project.setId(PROJECT_ID);
		when(projectService.read(PROJECT_ID)).thenReturn(project);

		template.setName(TEMPLATE_NAME);
		template.setFields(ImmutableList.of(new MetadataTemplateField("FIELD 1", "text")));
		ProjectMetadataTemplateJoin projectMetadataTemplateJoin = new ProjectMetadataTemplateJoin(project, template);
		when(templateService.getMetadataTemplatesForProject(project)).thenReturn(
				ImmutableList.of(projectMetadataTemplateJoin));
		MetadataTemplate newTemplate = new MetadataTemplate(template.getName(), template.getFields());
		newTemplate.setId(NEW_TEMPLATE_ID);
		when(templateService.createMetadataTemplateInProject(template, project)).thenReturn(new ProjectMetadataTemplateJoin(project, newTemplate));
	}

	@Test
	public void testGetProjectMetadataTemplates() {
		List<MetadataTemplate> join = service.getProjectMetadataTemplates(PROJECT_ID);
		verify(projectService, times(1)).read(PROJECT_ID);
		verify(templateService, times(1)).getMetadataTemplatesForProject(project);
		Assert.assertEquals("Should have 1 template", 1, join.size());
		Assert.assertEquals("Should have the correct template name", TEMPLATE_NAME, join.get(0).getName());
	}

	@Test
	public void testCreateMetadataTemplate() {
		MetadataTemplate newTemplate = service.createMetadataTemplate(template, PROJECT_ID);
		verify(projectService, times(1)).read(PROJECT_ID);
		verify(templateService, times(1)).createMetadataTemplateInProject(template, project);
		Assert.assertEquals("Should have the same template name", template.getLabel(), newTemplate.getName());
		Assert.assertEquals("Should have a new identifier", NEW_TEMPLATE_ID, newTemplate.getId());
	}
}
