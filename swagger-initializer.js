window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: {
      openapi: "3.0.3",
      info: {
        title: "Host Calendar & Availability Control API",
        version: "1.0.0",
        description: "APIs to manage host calendar, availability windows, blocks, and to check conflicts for bookings."
      },
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "http://localhost:3000", description: "Local dev" }
      ],
      security: [{ bearerAuth: [] }],
      paths: {

        // ─────────────────────────────────────────
        // 1. GET CALENDAR
        // ─────────────────────────────────────────

        "/hosts/{hostId}/calendar": {
          get: {
            tags: ["Calendar"],
            summary: "Get calendar days for a host in a date range",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "start", in: "query", required: true, schema: { type: "string", format: "date" }, example: "2026-02-27" },
              { name: "end", in: "query", required: true, schema: { type: "string", format: "date" }, example: "2026-03-05" }
            ],
            responses: {
              "200": {
                description: "Calendar days returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/CalendarResponse" },
                    examples: {
                      weekRange: {
                        summary: "200 — mixed statuses across a week",
                        value: {
                          hostId: "host123",
                          days: [
                            { date: "2026-02-27", status: "available" },
                            { date: "2026-02-28", status: "booked" },
                            { date: "2026-03-01", status: "available" },
                            { date: "2026-03-02", status: "blocked" },
                            { date: "2026-03-03", status: "available" },
                            { date: "2026-03-04", status: "pending" },
                            { date: "2026-03-05", status: "available" }
                          ]
                        }
                      },
                      fullyAvailable: {
                        summary: "200 — all days available (freshly listed property)",
                        value: {
                          hostId: "host123",
                          days: [
                            { date: "2026-02-27", status: "available" },
                            { date: "2026-02-28", status: "available" },
                            { date: "2026-03-01", status: "available" },
                            { date: "2026-03-02", status: "available" },
                            { date: "2026-03-03", status: "available" },
                            { date: "2026-03-04", status: "available" },
                            { date: "2026-03-05", status: "available" }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — invalid or missing date parameters",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      missingDates: {
                        summary: "400 — start or end query param missing",
                        value: { code: "MISSING_PARAMS", message: "Both 'start' and 'end' query parameters are required." }
                      },
                      invalidDateRange: {
                        summary: "400 — end date is before start date",
                        value: { code: "INVALID_DATE_RANGE", message: "The 'end' date must be after the 'start' date." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Host not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      hostNotFound: {
                        summary: "404 — host ID does not exist",
                        value: { code: "HOST_NOT_FOUND", message: "No host found with ID host123." }
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorised — missing or invalid bearer token",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      unauthorized: {
                        summary: "401 — token missing or expired",
                        value: { code: "UNAUTHORIZED", message: "Authentication token is missing or has expired." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 2. GET / CREATE AVAILABILITY SLOTS
        // ─────────────────────────────────────────

        "/hosts/{hostId}/availability": {
          get: {
            tags: ["Availability"],
            summary: "Get slot status for host",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            responses: {
              "200": {
                description: "Availability slots returned successfully",
                content: {
                  "application/json": {
                    schema: { type: "array", items: { $ref: "#/components/schemas/AvailabilitySlot" } },
                    examples: {
                      mixedSlots: {
                        summary: "200 — slots with mixed statuses",
                        value: [
                          { id: "slot1", status: "available" },
                          { id: "slot2", status: "booked" },
                          { id: "slot3", status: "blocked" }
                        ]
                      },
                      noSlots: {
                        summary: "200 — host has no slots configured yet",
                        value: []
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorised — missing or invalid bearer token",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      unauthorized: {
                        summary: "401 — token missing or expired",
                        value: { code: "UNAUTHORIZED", message: "Authentication token is missing or has expired." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Host not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      hostNotFound: {
                        summary: "404 — host ID does not exist",
                        value: { code: "HOST_NOT_FOUND", message: "No host found with ID host123." }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            tags: ["Availability"],
            summary: "Create an availability slot",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AvailabilitySlotCreate" },
                  examples: {
                    createAvailable: {
                      summary: "POST — create available slot",
                      value: { hostId: "host123", status: "available" }
                    },
                    createBlocked: {
                      summary: "POST — create blocked slot",
                      value: { hostId: "host123", status: "blocked" }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Slot created successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AvailabilitySlot" },
                    examples: {
                      created: {
                        summary: "201 — new available slot created",
                        value: { id: "slot4", status: "available" }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — invalid status value",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidStatus: {
                        summary: "400 — unrecognised status value",
                        value: { code: "INVALID_STATUS", message: "Status must be one of: available, blocked, booked, pending." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Conflict — slot overlaps with an existing booking or block",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      conflict: {
                        summary: "409 — date range already occupied",
                        value: { code: "SLOT_CONFLICT", message: "The requested slot overlaps with an existing booking or blocked period." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Host not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      hostNotFound: {
                        summary: "404 — host ID does not exist",
                        value: { code: "HOST_NOT_FOUND", message: "No host found with ID host123." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 3. UPDATE / DELETE AVAILABILITY SLOT
        // ─────────────────────────────────────────

        "/hosts/{hostId}/availability/{slotId}": {
          put: {
            tags: ["Availability"],
            summary: "Update availability slot",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "slotId", in: "path", required: true, schema: { type: "string" }, example: "slot4" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AvailabilitySlotUpdate" },
                  examples: {
                    bookSlot: {
                      summary: "PUT — mark slot as booked",
                      value: { status: "booked", startDate: "2026-03-05", endDate: "2026-03-06" }
                    },
                    makeAvailable: {
                      summary: "PUT — reopen slot as available",
                      value: { status: "available", startDate: "2026-03-05", endDate: "2026-03-06" }
                    },
                    blockSlot: {
                      summary: "PUT — block the slot",
                      value: { status: "blocked", startDate: "2026-03-10", endDate: "2026-03-12" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Slot updated successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AvailabilitySlot" },
                    examples: {
                      bookedSlot: {
                        summary: "200 — slot updated to booked",
                        value: { id: "slot4", status: "booked" }
                      },
                      availableSlot: {
                        summary: "200 — slot reopened as available",
                        value: { id: "slot4", status: "available" }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — invalid status or date range",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidTransition: {
                        summary: "400 — cannot transition from booked to pending directly",
                        value: { code: "INVALID_STATUS_TRANSITION", message: "Slot cannot be moved from 'booked' to 'pending' directly. Cancel the booking first." }
                      },
                      invalidDates: {
                        summary: "400 — end date before start date",
                        value: { code: "INVALID_DATE_RANGE", message: "The 'endDate' must be after the 'startDate'." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Slot or host not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      slotNotFound: {
                        summary: "404 — slot ID does not exist",
                        value: { code: "SLOT_NOT_FOUND", message: "No availability slot found with ID slot4 for host host123." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Conflict — update clashes with an existing confirmed booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      bookingConflict: {
                        summary: "409 — slot has an active booking, cannot block",
                        value: { code: "BOOKING_CONFLICT", message: "Slot slot4 has an active confirmed booking and cannot be blocked or modified." }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            tags: ["Availability"],
            summary: "Delete availability slot",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "slotId", in: "path", required: true, schema: { type: "string" }, example: "slot4" }
            ],
            responses: {
              "204": {
                description: "Slot deleted successfully — no content returned"
              },
              "404": {
                description: "Slot or host not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      slotNotFound: {
                        summary: "404 — slot ID does not exist",
                        value: { code: "SLOT_NOT_FOUND", message: "No availability slot found with ID slot4 for host host123." }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Unprocessable — cannot delete a slot with an active confirmed booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      activeBooking: {
                        summary: "422 — slot tied to a confirmed booking",
                        value: { code: "SLOT_HAS_ACTIVE_BOOKING", message: "Slot slot4 cannot be deleted because it is linked to an active confirmed booking. Cancel the booking first." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 4. BLOCK DATES
        // ─────────────────────────────────────────

        "/hosts/{hostId}/block-dates": {
          post: {
            tags: ["Blocks"],
            summary: "Block a date range",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BlockDatesRequest" },
                  examples: {
                    maintenanceBlock: {
                      summary: "POST — block for maintenance",
                      value: { hostId: "host123", startDate: "2026-03-10", endDate: "2026-03-12", reason: "Maintenance" }
                    },
                    personalBlock: {
                      summary: "POST — block for personal use",
                      value: { hostId: "host123", startDate: "2026-04-01", endDate: "2026-04-07", reason: "Family visit" }
                    },
                    renovationBlock: {
                      summary: "POST — block for renovation",
                      value: { hostId: "host123", startDate: "2026-05-01", endDate: "2026-05-14", reason: "Renovation" }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Date range blocked successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        reason: { type: "string" }
                      }
                    },
                    examples: {
                      blockedMaintenance: {
                        summary: "201 — maintenance block created",
                        value: { id: "block1", startDate: "2026-03-10", endDate: "2026-03-12", reason: "Maintenance" }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — missing fields or invalid date range",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      missingReason: {
                        summary: "400 — reason field is required",
                        value: { code: "MISSING_FIELD", message: "The 'reason' field is required when blocking dates." }
                      },
                      invalidRange: {
                        summary: "400 — end date before start date",
                        value: { code: "INVALID_DATE_RANGE", message: "The 'endDate' must be after the 'startDate'." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Conflict — date range overlaps with a confirmed booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      bookingConflict: {
                        summary: "409 — dates already have a confirmed booking",
                        value: { code: "BOOKING_CONFLICT", message: "Cannot block 2026-03-10 to 2026-03-12. A confirmed booking exists within this range." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Host not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      hostNotFound: {
                        summary: "404 — host ID does not exist",
                        value: { code: "HOST_NOT_FOUND", message: "No host found with ID host123." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 5. UNBLOCK DATES
        // ─────────────────────────────────────────

        "/hosts/{hostId}/unblock-dates": {
          post: {
            tags: ["Blocks"],
            summary: "Remove blocked dates",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UnblockDatesRequest" },
                  examples: {
                    unblockSingle: {
                      summary: "POST — remove single block",
                      value: { hostId: "host123", blockIds: ["block1"] }
                    },
                    unblockMultiple: {
                      summary: "POST — remove multiple blocks",
                      value: { hostId: "host123", blockIds: ["block1", "block2", "block3"] }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Blocks removed successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BulkResult" },
                    examples: {
                      singleDeleted: {
                        summary: "200 — one block removed",
                        value: { created: 0, updated: 0, deleted: 1 }
                      },
                      multipleDeleted: {
                        summary: "200 — multiple blocks removed",
                        value: { created: 0, updated: 0, deleted: 3 }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — blockIds array is empty or malformed",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      emptyList: {
                        summary: "400 — blockIds array must not be empty",
                        value: { code: "EMPTY_BLOCK_IDS", message: "The 'blockIds' array must contain at least one block ID." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "One or more block IDs not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      blockNotFound: {
                        summary: "404 — block ID does not exist",
                        value: { code: "BLOCK_NOT_FOUND", message: "No block found with ID block99 for host host123." }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Unprocessable — block cannot be removed as dates are now tied to a booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      linkedToBooking: {
                        summary: "422 — block has an associated confirmed booking",
                        value: { code: "BLOCK_LINKED_TO_BOOKING", message: "Block block1 cannot be removed. The dates are now linked to a confirmed booking." }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
          CalendarDay: {
            type: "object",
            properties: {
              date: { type: "string", format: "date", example: "2026-03-01" },
              status: { type: "string", enum: ["available", "booked", "blocked", "pending"], example: "available" }
            }
          },
          CalendarResponse: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              days: { type: "array", items: { $ref: "#/components/schemas/CalendarDay" } }
            }
          },
          AvailabilitySlot: {
            type: "object",
            properties: {
              id: { type: "string", example: "slot1" },
              status: { type: "string", enum: ["available", "booked", "blocked", "pending"], example: "available" }
            }
          },
          AvailabilitySlotCreate: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              status: { type: "string", enum: ["available", "blocked"], example: "available" }
            }
          },
          AvailabilitySlotUpdate: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["available", "booked", "blocked", "pending"], example: "booked" },
              startDate: { type: "string", format: "date", example: "2026-03-05" },
              endDate: { type: "string", format: "date", example: "2026-03-06" }
            }
          },
          BlockDatesRequest: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              startDate: { type: "string", format: "date", example: "2026-03-10" },
              endDate: { type: "string", format: "date", example: "2026-03-12" },
              reason: { type: "string", example: "Maintenance" }
            }
          },
          UnblockDatesRequest: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              blockIds: { type: "array", items: { type: "string" }, example: ["block1", "block2"] }
            }
          },
          BulkResult: {
            type: "object",
            properties: {
              created: { type: "integer", example: 0 },
              updated: { type: "integer", example: 0 },
              deleted: { type: "integer", example: 1 }
            }
          },
          ErrorResponse: {
            type: "object",
            properties: {
              code: { type: "string", example: "HOST_NOT_FOUND" },
              message: { type: "string", example: "No host found with ID host123." }
            }
          }
        }
      }
    },
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout"
  });
};
