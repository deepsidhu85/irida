package ca.corefacility.bioinformatics.irida.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration;
import org.springframework.security.core.userdetails.UserDetailsChecker;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import ca.corefacility.bioinformatics.irida.repositories.user.UserRepository;
import ca.corefacility.bioinformatics.irida.security.IgnoreExpiredCredentialsForPasswordChangeChecker;
import ca.corefacility.bioinformatics.irida.security.permissions.BasePermission;
import ca.corefacility.bioinformatics.irida.security.permissions.IridaPermissionEvaluator;
import ca.corefacility.bioinformatics.irida.service.user.UserService;

import com.google.common.base.Joiner;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@ComponentScan(basePackages = "ca.corefacility.bioinformatics.irida.security")
@Import(IridaOAuth2Config.class)
public class IridaApiSecurityConfig extends GlobalMethodSecurityConfiguration {

	private static final String[] ROLE_HIERARCHIES = new String[] { "ROLE_ADMIN > ROLE_MANAGER",
			"ROLE_MANAGER > ROLE_USER", "ROLE_ADMIN > ROLE_SEQUENCER" };

	private static final String ROLE_HIERARCHY = Joiner.on('\n').join(ROLE_HIERARCHIES);

	/**
	 * Loads all of the {@link BasePermission} sub-classes found in the security
	 * package during component scan. {@link BasePermission} classes are used in
	 * {@link @PreAuthorize} annotations for verifying that a user has
	 * permission to invoke a method by the expression handler.
	 */
	@Autowired
	private List<BasePermission<?>> basePermissions;

	@Autowired
	private UserRepository userRepository;

	@Override
	protected MethodSecurityExpressionHandler createExpressionHandler() {
		DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
		IridaPermissionEvaluator permissionEvaluator = new IridaPermissionEvaluator(basePermissions);
		permissionEvaluator.init();
		handler.setPermissionEvaluator(permissionEvaluator);
		RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();
		roleHierarchy.setHierarchy(ROLE_HIERARCHY);
		handler.setRoleHierarchy(roleHierarchy);
		return handler;
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userRepository).passwordEncoder(passwordEncoder());
		auth.authenticationProvider(authenticationProvider());
	}

	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
		authenticationProvider.setUserDetailsService(userRepository);
		authenticationProvider.setPasswordEncoder(passwordEncoder());
		authenticationProvider.setPostAuthenticationChecks(postAuthenticationChecker());
		return authenticationProvider;
	}

	/**
	 * After a user has been authenticated, we want to allow them to change
	 * their password if the password is expired. The
	 * {@link IgnoreExpiredCredentialsForPasswordChangeChecker} allows
	 * authenticated users with expired credentials to invoke one method, the
	 * {@link UserService.changePassword} method.
	 * 
	 * @return
	 */
	@Bean
	public UserDetailsChecker postAuthenticationChecker() {
		return new IgnoreExpiredCredentialsForPasswordChangeChecker();
	}

	@Bean
	public AuthenticationManager authenticationManager() throws Exception {
		return super.authenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
