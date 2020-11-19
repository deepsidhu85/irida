package ca.corefacility.bioinformatics.irida.ria.unit.web.files;

import java.io.IOException;

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import ca.corefacility.bioinformatics.irida.model.workflow.analysis.AnalysisFastQC;
import ca.corefacility.bioinformatics.irida.ria.web.files.SequenceFileAjaxController;
import ca.corefacility.bioinformatics.irida.ria.web.files.dto.FastQCDetailsResponse;
import ca.corefacility.bioinformatics.irida.ria.web.files.dto.FastQCImagesResponse;
import ca.corefacility.bioinformatics.irida.ria.web.services.UISequenceFileService;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

public class SequenceFileAjaxControllerTest {
	public static final Long FILE_ID = 1L;
	public static final Long OBJECT_ID = 2L;

	private UISequenceFileService uiSequenceFileService;
	private SequenceFileAjaxController sequenceFileAjaxController;

	@Before
	public void setUp() {
		uiSequenceFileService = mock(UISequenceFileService.class);
		sequenceFileAjaxController = new SequenceFileAjaxController(uiSequenceFileService);
	}

	@Test
	public void testGetFastQCDetails() {
		ResponseEntity<FastQCDetailsResponse> response = sequenceFileAjaxController.getFastQCDetails(OBJECT_ID, FILE_ID);
		assertEquals("Receive an 200 OK response", response.getStatusCode(), HttpStatus.OK);
	}

	@Test
	public void testGetFastQCImages() throws IOException {
		ResponseEntity<FastQCImagesResponse> response = sequenceFileAjaxController.getFastQCCharts(OBJECT_ID, FILE_ID);
		assertEquals("Receive an 200 OK response", response.getStatusCode(), HttpStatus.OK);
	}

	@Test
	public void testOverRepresentedSequences() {
		ResponseEntity<AnalysisFastQC> response = sequenceFileAjaxController.getOverRepresentedSequences(OBJECT_ID, FILE_ID);
		assertEquals("Receive an 200 OK response", response.getStatusCode(), HttpStatus.OK);
	}

}
