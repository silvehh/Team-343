package com.team.summs_backend.dto;

import java.util.List;

public record SignupRequest(
	String email,
	String password,
	String username,
	String accountType,
	List<String> mobilityOptions
) {
}
