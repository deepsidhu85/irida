package ca.corefacility.bioinformatics.irida.model.user.group;

import java.util.Date;
import java.util.Objects;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;

import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import ca.corefacility.bioinformatics.irida.model.joins.Join;
import ca.corefacility.bioinformatics.irida.model.user.User;

/**
 * A relationship between an individual {@link User} account and a
 * {@link UserGroup}. This class closely mirrors the {@link ProjectUserJoin} in
 * that a {@link UserGroup} is assigned a level of access using the
 * {@link ProjectRole} enum.
 */
@Entity
@Table(name = "user_group_member")
@Audited
@EntityListeners(AuditingEntityListener.class)
public final class UserGroupJoin implements Join<User, UserGroup> {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private final Long id;

	@ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.DETACH)
	@JoinColumn(name = "user_id")
	@NotNull
	private final User user;

	@ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.DETACH)
	@JoinColumn(name = "group_id")
	@NotNull
	private final UserGroup group;

	@Column(name = "created_date")
	@CreatedDate
	@NotNull
	@Temporal(TemporalType.TIMESTAMP)
	private final Date createdDate;

	@NotNull
	@Enumerated(EnumType.STRING)
	private UserGroupRole role;

	/**
	 * Create a new {@link UserGroupJoin}.
	 * 
	 * @param user
	 *            the {@link User} in the {@link UserGroup}.
	 * @param group
	 *            the {@link UserGroup} that the {@link User} is a member of.
	 */
	public UserGroupJoin(final User user, final UserGroup group) {
		this.createdDate = new Date();
		this.id = null;
		this.user = user;
		this.group = group;
	}

	public int hashCode() {
		return Objects.hash(user, group, createdDate, role);
	}

	public boolean equals(final Object o) {
		if (o == this) {
			return true;
		} else if (o instanceof UserGroupJoin) {
			final UserGroupJoin u = (UserGroupJoin) o;
			return Objects.equals(u.user, this.user) && Objects.equals(u.group, this.group)
					&& Objects.equals(u.createdDate, this.createdDate) && Objects.equals(u.role, this.role);
		}

		return false;
	}

	public enum UserGroupRole {
		GROUP_OWNER, GROUP_MEMBER
	}

	@Override
	public String getLabel() {
		return null;
	}

	@Override
	public Long getId() {
		return this.id;
	}

	@Override
	public Date getCreatedDate() {
		return this.createdDate;
	}

	@Override
	public User getSubject() {
		return this.user;
	}

	@Override
	public UserGroup getObject() {
		return this.group;
	}

	@Override
	public Date getTimestamp() {
		return this.createdDate;
	}

}