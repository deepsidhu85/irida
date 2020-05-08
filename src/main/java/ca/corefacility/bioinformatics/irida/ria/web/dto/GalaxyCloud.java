package ca.corefacility.bioinformatics.irida.ria.web.dto;

import java.util.ArrayList;

public class GalaxyCloud {

	private String history_id;
	private String authz_id;
	private String bucket;
	private ArrayList<String> objects;

	public GalaxyCloud(String history_id, String authz_id, String bucket, ArrayList<String> objects) {
		this.history_id = history_id;
		this.authz_id = authz_id;
		this.bucket = bucket;
		this.objects = objects;
	}

	public String getHistory_id() {
		return history_id;
	}

	public void setHistory_id(String history_id) {
		this.history_id = history_id;
	}

	public String getAuthz_id() {
		return authz_id;
	}

	public void setAuthz_id(String authz_id) {
		this.authz_id = authz_id;
	}

	public String getBucket() {
		return bucket;
	}

	public void setBucket(String bucket) {
		this.bucket = bucket;
	}

	public ArrayList<String> getObjects() {
		return objects;
	}

	public void setObjects(ArrayList<String> objects) {
		this.objects = objects;
	}

}
