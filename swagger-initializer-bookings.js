window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: {
      openapi: "3.0.3",
      info: {
        title: "Booking History & Status Tracking API",
        version: "1.0.0",
        description: "APIs to manage booking lifecycle, real-time status tracking, booking history for guests and hosts, check-in/check-out flows, and booking modifications on the Airbnb platform."
      },
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "http://localhost:3000", description: "Local dev" }
      ],
      security: [{ bearerAuth: [] }],
      paths: {

        // ─────────────────────────────────────────
        // 1. BOOKING CREATION & CORE
        // ─────────────────────────────────────────

        "/bookings": {
          post: {
            tags: ["Booking Core"],
            summary: "Create a new booking",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingCreateRequest" },
                  examples: {
                    standard: {
                      summary: "POST /bookings — standard booking request",
                      value: {
                        listingId: "listing_nyc_001",
                        guestId: "cust001",
                        hostId: "host123",
                        checkIn: "2026-04-10",
                        checkOut: "2026-04-14",
                        guests: { adults: 2, children: 1, infants: 0 },
                        totalPrice: 520.00,
                        currency: "USD",
                        specialRequests: "Early check-in if possible"
                      }
                    },
                    instantBook: {
                      summary: "POST /bookings — instant book enabled listing",
                      value: {
                        listingId: "listing_la_007",
                        guestId: "cust002",
                        hostId: "host456",
                        checkIn: "2026-05-01",
                        checkOut: "2026-05-03",
                        guests: { adults: 2, children: 0, infants: 0 },
                        totalPrice: 280.00,
                        currency: "USD",
                        specialRequests: ""
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Booking created successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Booking" },
                    examples: {
                      pendingApproval: {
                        summary: "201 — booking created, awaiting host approval",
                        value: {
                          bookingId: "booking_101",
                          listingId: "listing_nyc_001",
                          guestId: "cust001",
                          hostId: "host123",
                          checkIn: "2026-04-10",
                          checkOut: "2026-04-14",
                          nights: 4,
                          guests: { adults: 2, children: 1, infants: 0 },
                          totalPrice: 520.00,
                          currency: "USD",
                          status: "pending_approval",
                          specialRequests: "Early check-in if possible",
                          createdAt: "2026-03-01T12:00:00Z",
                          updatedAt: "2026-03-01T12:00:00Z"
                        }
                      },
                      instantBooked: {
                        summary: "201 — instant book confirmed immediately",
                        value: {
                          bookingId: "booking_102",
                          listingId: "listing_la_007",
                          guestId: "cust002",
                          hostId: "host456",
                          checkIn: "2026-05-01",
                          checkOut: "2026-05-03",
                          nights: 2,
                          guests: { adults: 2, children: 0, infants: 0 },
                          totalPrice: 280.00,
                          currency: "USD",
                          status: "confirmed",
                          specialRequests: "",
                          createdAt: "2026-03-01T13:00:00Z",
                          updatedAt: "2026-03-01T13:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — missing or invalid fields",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      missingFields: {
                        summary: "400 — required fields missing",
                        value: { code: "MISSING_FIELDS", message: "Fields 'listingId', 'checkIn', and 'checkOut' are required." }
                      },
                      invalidDateRange: {
                        summary: "400 — checkout is before check-in",
                        value: { code: "INVALID_DATE_RANGE", message: "The 'checkOut' date must be after the 'checkIn' date." }
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
              "409": {
                description: "Conflict — listing is not available for the requested dates",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      dateConflict: {
                        summary: "409 — listing already booked for those dates",
                        value: { code: "LISTING_UNAVAILABLE", message: "Listing listing_nyc_001 is not available from 2026-04-10 to 2026-04-14." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 2. GET BOOKING DETAILS
        // ─────────────────────────────────────────

        "/bookings/{bookingId}": {
          get: {
            tags: ["Booking Core"],
            summary: "Get full details of a booking",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" }
            ],
            responses: {
              "200": {
                description: "Booking details returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Booking" },
                    examples: {
                      confirmed: {
                        summary: "200 — confirmed upcoming booking",
                        value: {
                          bookingId: "booking_101",
                          listingId: "listing_nyc_001",
                          guestId: "cust001",
                          hostId: "host123",
                          checkIn: "2026-04-10",
                          checkOut: "2026-04-14",
                          nights: 4,
                          guests: { adults: 2, children: 1, infants: 0 },
                          totalPrice: 520.00,
                          currency: "USD",
                          status: "confirmed",
                          specialRequests: "Early check-in if possible",
                          createdAt: "2026-03-01T12:00:00Z",
                          updatedAt: "2026-03-02T09:00:00Z"
                        }
                      },
                      checkedIn: {
                        summary: "200 — guest currently checked in",
                        value: {
                          bookingId: "booking_101",
                          listingId: "listing_nyc_001",
                          guestId: "cust001",
                          hostId: "host123",
                          checkIn: "2026-04-10",
                          checkOut: "2026-04-14",
                          nights: 4,
                          guests: { adults: 2, children: 1, infants: 0 },
                          totalPrice: 520.00,
                          currency: "USD",
                          status: "checked_in",
                          specialRequests: "Early check-in if possible",
                          createdAt: "2026-03-01T12:00:00Z",
                          updatedAt: "2026-04-10T15:30:00Z"
                        }
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
              "403": {
                description: "Forbidden — caller is not the guest or host of this booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      forbidden: {
                        summary: "403 — user does not have access to this booking",
                        value: { code: "ACCESS_DENIED", message: "You do not have permission to view booking booking_101." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Booking not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "404 — booking ID does not exist",
                        value: { code: "BOOKING_NOT_FOUND", message: "No booking found with ID booking_999." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 3 & 4. BOOKING STATUS TRACKING
        // ─────────────────────────────────────────

        "/bookings/{bookingId}/status": {
          get: {
            tags: ["Status Tracking"],
            summary: "Get current real-time status of a booking",
            description: "Returns the current status and a full timeline of all status transitions for a booking. Use this for real-time progress tracking.",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" }
            ],
            responses: {
              "200": {
                description: "Booking status with full timeline returned",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingStatusResponse" },
                    examples: {
                      confirmedStatus: {
                        summary: "200 — confirmed, upcoming stay",
                        value: {
                          bookingId: "booking_101",
                          currentStatus: "confirmed",
                          timeline: [
                            { status: "pending_approval", timestamp: "2026-03-01T12:00:00Z", note: "Booking request submitted by guest" },
                            { status: "confirmed", timestamp: "2026-03-02T09:00:00Z", note: "Host approved the booking request" }
                          ],
                          nextExpectedStatus: "checked_in",
                          nextActionDue: "2026-04-10"
                        }
                      },
                      activeStay: {
                        summary: "200 — guest currently staying",
                        value: {
                          bookingId: "booking_101",
                          currentStatus: "checked_in",
                          timeline: [
                            { status: "pending_approval", timestamp: "2026-03-01T12:00:00Z", note: "Booking request submitted by guest" },
                            { status: "confirmed", timestamp: "2026-03-02T09:00:00Z", note: "Host approved the booking request" },
                            { status: "checked_in", timestamp: "2026-04-10T15:30:00Z", note: "Guest checked in via smart lock code" }
                          ],
                          nextExpectedStatus: "checked_out",
                          nextActionDue: "2026-04-14"
                        }
                      },
                      completed: {
                        summary: "200 — stay fully completed",
                        value: {
                          bookingId: "booking_101",
                          currentStatus: "completed",
                          timeline: [
                            { status: "pending_approval", timestamp: "2026-03-01T12:00:00Z", note: "Booking request submitted by guest" },
                            { status: "confirmed", timestamp: "2026-03-02T09:00:00Z", note: "Host approved the booking request" },
                            { status: "checked_in", timestamp: "2026-04-10T15:30:00Z", note: "Guest checked in via smart lock code" },
                            { status: "checked_out", timestamp: "2026-04-14T11:00:00Z", note: "Guest checked out" },
                            { status: "completed", timestamp: "2026-04-14T12:00:00Z", note: "Stay completed, payout scheduled" }
                          ],
                          nextExpectedStatus: null,
                          nextActionDue: null
                        }
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
                description: "Booking not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "404 — booking ID does not exist",
                        value: { code: "BOOKING_NOT_FOUND", message: "No booking found with ID booking_999." }
                      }
                    }
                  }
                }
              }
            }
          },
          put: {
            tags: ["Status Tracking"],
            summary: "Update the status of a booking",
            description: "Manually advance a booking status. Used by hosts (approve/decline), guests (cancel), and the system (check-in/check-out triggers).",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingStatusUpdateRequest" },
                  examples: {
                    hostApproves: {
                      summary: "PUT — host approves booking",
                      value: { status: "confirmed", note: "Welcome! Looking forward to hosting you." }
                    },
                    hostDeclines: {
                      summary: "PUT — host declines booking",
                      value: { status: "declined", note: "Property unavailable due to unexpected maintenance." }
                    },
                    guestCancels: {
                      summary: "PUT — guest cancels booking",
                      value: { status: "cancelled_by_guest", note: "Travel plans changed." }
                    },
                    checkIn: {
                      summary: "PUT — guest checks in",
                      value: { status: "checked_in", note: "Guest checked in via smart lock code" }
                    },
                    checkOut: {
                      summary: "PUT — guest checks out",
                      value: { status: "checked_out", note: "Guest checked out on time" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Status updated successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingStatusResponse" },
                    examples: {
                      nowConfirmed: {
                        summary: "200 — status updated to confirmed",
                        value: {
                          bookingId: "booking_101",
                          currentStatus: "confirmed",
                          timeline: [
                            { status: "pending_approval", timestamp: "2026-03-01T12:00:00Z", note: "Booking request submitted by guest" },
                            { status: "confirmed", timestamp: "2026-03-02T09:00:00Z", note: "Welcome! Looking forward to hosting you." }
                          ],
                          nextExpectedStatus: "checked_in",
                          nextActionDue: "2026-04-10"
                        }
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
              "403": {
                description: "Forbidden — caller is not authorised to perform this status update",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      forbidden: {
                        summary: "403 — guest attempting to approve their own booking",
                        value: { code: "ACCESS_DENIED", message: "Only the host can approve or decline a booking request." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Booking not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "404 — booking ID does not exist",
                        value: { code: "BOOKING_NOT_FOUND", message: "No booking found with ID booking_999." }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Unprocessable — invalid status transition",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidTransition: {
                        summary: "422 — cannot move from completed to checked_in",
                        value: { code: "INVALID_STATUS_TRANSITION", message: "Cannot transition from 'completed' to 'checked_in'." }
                      },
                      alreadyCancelled: {
                        summary: "422 — booking is already cancelled",
                        value: { code: "BOOKING_ALREADY_CANCELLED", message: "Booking booking_101 has already been cancelled and cannot be updated." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 5. GUEST BOOKING HISTORY
        // ─────────────────────────────────────────

        "/guests/{guestId}/bookings": {
          get: {
            tags: ["Guest Booking History"],
            summary: "List all bookings made by a guest",
            description: "Returns full guest booking history with optional filters for status, date range, and pagination. Use status=confirmed for upcoming trips and status=completed for past stays.",
            parameters: [
              { name: "guestId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              {
                name: "status", in: "query", required: false,
                schema: { type: "string", enum: ["pending_approval", "confirmed", "checked_in", "checked_out", "completed", "cancelled_by_guest", "cancelled_by_host", "declined"] },
                example: "completed"
              },
              { name: "start", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-01-01" },
              { name: "end", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-12-31" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Guest booking history returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingListResponse" },
                    examples: {
                      allBookings: {
                        summary: "200 — full booking history",
                        value: {
                          guestId: "cust001",
                          bookings: [
                            { bookingId: "booking_101", listingId: "listing_nyc_001", checkIn: "2026-04-10", checkOut: "2026-04-14", nights: 4, totalPrice: 520.00, currency: "USD", status: "confirmed" },
                            { bookingId: "booking_090", listingId: "listing_miami_003", checkIn: "2026-02-14", checkOut: "2026-02-17", nights: 3, totalPrice: 390.00, currency: "USD", status: "completed" },
                            { bookingId: "booking_075", listingId: "listing_chicago_011", checkIn: "2025-12-20", checkOut: "2025-12-25", nights: 5, totalPrice: 610.00, currency: "USD", status: "completed" }
                          ],
                          totalCount: 3,
                          page: 1,
                          limit: 10
                        }
                      },
                      upcomingOnly: {
                        summary: "200 — filtered to confirmed/upcoming trips only",
                        value: {
                          guestId: "cust001",
                          bookings: [
                            { bookingId: "booking_101", listingId: "listing_nyc_001", checkIn: "2026-04-10", checkOut: "2026-04-14", nights: 4, totalPrice: 520.00, currency: "USD", status: "confirmed" }
                          ],
                          totalCount: 1,
                          page: 1,
                          limit: 10
                        }
                      },
                      noBookings: {
                        summary: "200 — guest has no bookings yet",
                        value: {
                          guestId: "cust099",
                          bookings: [],
                          totalCount: 0,
                          page: 1,
                          limit: 10
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — invalid query parameters",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidStatus: {
                        summary: "400 — unrecognised status filter value",
                        value: { code: "INVALID_STATUS", message: "'unknown_status' is not a valid booking status filter." }
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
                description: "Guest not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      guestNotFound: {
                        summary: "404 — guest ID does not exist",
                        value: { code: "GUEST_NOT_FOUND", message: "No guest account found with ID cust999." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 6. HOST BOOKING HISTORY
        // ─────────────────────────────────────────

        "/hosts/{hostId}/bookings": {
          get: {
            tags: ["Host Booking History"],
            summary: "List all bookings received by a host",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              {
                name: "status", in: "query", required: false,
                schema: { type: "string", enum: ["pending_approval", "confirmed", "checked_in", "checked_out", "completed", "cancelled_by_guest", "cancelled_by_host", "declined"] },
                example: "pending_approval"
              },
              { name: "listingId", in: "query", required: false, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "start", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-01" },
              { name: "end", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-06-30" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Host booking list returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingListResponse" },
                    examples: {
                      pendingRequests: {
                        summary: "200 — filtered to pending approval requests",
                        value: {
                          hostId: "host123",
                          bookings: [
                            { bookingId: "booking_103", listingId: "listing_nyc_001", guestId: "cust005", checkIn: "2026-05-10", checkOut: "2026-05-13", nights: 3, totalPrice: 390.00, currency: "USD", status: "pending_approval" }
                          ],
                          totalCount: 1,
                          page: 1,
                          limit: 10
                        }
                      },
                      allBookings: {
                        summary: "200 — full booking history across all listings",
                        value: {
                          hostId: "host123",
                          bookings: [
                            { bookingId: "booking_101", listingId: "listing_nyc_001", guestId: "cust001", checkIn: "2026-04-10", checkOut: "2026-04-14", nights: 4, totalPrice: 520.00, currency: "USD", status: "confirmed" },
                            { bookingId: "booking_098", listingId: "listing_nyc_001", guestId: "cust004", checkIn: "2026-03-05", checkOut: "2026-03-08", nights: 3, totalPrice: 390.00, currency: "USD", status: "completed" },
                            { bookingId: "booking_103", listingId: "listing_nyc_001", guestId: "cust005", checkIn: "2026-05-10", checkOut: "2026-05-13", nights: 3, totalPrice: 390.00, currency: "USD", status: "pending_approval" }
                          ],
                          totalCount: 3,
                          page: 1,
                          limit: 10
                        }
                      },
                      noBookings: {
                        summary: "200 — no bookings found for the applied filters",
                        value: {
                          hostId: "host123",
                          bookings: [],
                          totalCount: 0,
                          page: 1,
                          limit: 10
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — invalid query parameters",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidDateRange: {
                        summary: "400 — end date is before start date",
                        value: { code: "INVALID_DATE_RANGE", message: "The 'end' date must be after the 'start' date." }
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
                        value: { code: "HOST_NOT_FOUND", message: "No host account found with ID host999." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 7. BOOKING MODIFICATIONS
        // ─────────────────────────────────────────

        "/bookings/{bookingId}/modify": {
          put: {
            tags: ["Booking Modifications"],
            summary: "Request a modification to an existing booking",
            description: "Either guest or host can request a change to dates, guest count, or price. The other party must accept before the modification takes effect.",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BookingModifyRequest" },
                  examples: {
                    extendDates: {
                      summary: "PUT — extend stay by 1 night",
                      value: {
                        requestedBy: "guest",
                        checkIn: "2026-04-10",
                        checkOut: "2026-04-15",
                        newTotalPrice: 650.00,
                        reason: "We'd like to extend our stay by one more night"
                      }
                    },
                    reduceDates: {
                      summary: "PUT — shorten stay by 1 night",
                      value: {
                        requestedBy: "guest",
                        checkIn: "2026-04-11",
                        checkOut: "2026-04-14",
                        newTotalPrice: 390.00,
                        reason: "Arriving one day later due to flight change"
                      }
                    },
                    updateGuests: {
                      summary: "PUT — update guest count",
                      value: {
                        requestedBy: "guest",
                        guests: { adults: 3, children: 1, infants: 0 },
                        newTotalPrice: 560.00,
                        reason: "One more adult joining the trip"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Modification request submitted and pending approval",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingModifyResponse" },
                    examples: {
                      modificationPending: {
                        summary: "200 — modification awaiting host approval",
                        value: {
                          bookingId: "booking_101",
                          modificationId: "mod_001",
                          status: "pending_approval",
                          requestedBy: "guest",
                          changes: { checkIn: "2026-04-10", checkOut: "2026-04-15", newTotalPrice: 650.00 },
                          reason: "We'd like to extend our stay by one more night",
                          requestedAt: "2026-03-10T08:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — invalid modification fields",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      noChanges: {
                        summary: "400 — no changes provided in request body",
                        value: { code: "NO_CHANGES_REQUESTED", message: "The modification request must include at least one change — dates, guests, or price." }
                      },
                      invalidDates: {
                        summary: "400 — new checkout is before new check-in",
                        value: { code: "INVALID_DATE_RANGE", message: "The modified 'checkOut' must be after 'checkIn'." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Booking not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "404 — booking ID does not exist",
                        value: { code: "BOOKING_NOT_FOUND", message: "No booking found with ID booking_999." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Conflict — new dates overlap with another confirmed booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      dateConflict: {
                        summary: "409 — extended dates clash with an existing booking",
                        value: { code: "DATE_CONFLICT", message: "The requested new dates overlap with an existing confirmed booking for this listing." }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Unprocessable — modification not permitted in current booking state",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyCheckedIn: {
                        summary: "422 — cannot modify dates after guest has checked in",
                        value: { code: "MODIFICATION_NOT_ALLOWED", message: "Date modifications are not permitted after the guest has already checked in." }
                      },
                      bookingCancelled: {
                        summary: "422 — booking is already cancelled",
                        value: { code: "BOOKING_CANCELLED", message: "Booking booking_101 has been cancelled and cannot be modified." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 8. CANCELLATIONS
        // ─────────────────────────────────────────

        "/bookings/{bookingId}/cancel": {
          post: {
            tags: ["Cancellations"],
            summary: "Cancel a booking",
            description: "Cancels a confirmed booking. Refund eligibility is determined by the listing's cancellation policy. Can be initiated by guest or host.",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CancellationRequest" },
                  examples: {
                    guestCancels: {
                      summary: "POST — guest cancels within free window",
                      value: { cancelledBy: "guest", reason: "Change of plans", refundRequested: true }
                    },
                    hostCancels: {
                      summary: "POST — host cancels due to property issue",
                      value: { cancelledBy: "host", reason: "Unexpected property damage requiring repairs", refundRequested: false }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Booking cancelled successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/CancellationResponse" },
                    examples: {
                      fullRefund: {
                        summary: "200 — guest cancelled within free window, full refund issued",
                        value: {
                          bookingId: "booking_101",
                          status: "cancelled_by_guest",
                          cancelledBy: "guest",
                          reason: "Change of plans",
                          refundAmount: 520.00,
                          refundStatus: "pending",
                          cancelledAt: "2026-03-15T10:00:00Z"
                        }
                      },
                      hostCancels: {
                        summary: "200 — host cancelled, guest automatically refunded in full",
                        value: {
                          bookingId: "booking_101",
                          status: "cancelled_by_host",
                          cancelledBy: "host",
                          reason: "Unexpected property damage requiring repairs",
                          refundAmount: 520.00,
                          refundStatus: "pending",
                          cancelledAt: "2026-03-16T07:00:00Z"
                        }
                      },
                      noRefund: {
                        summary: "200 — guest cancelled outside refund window, no refund applicable",
                        value: {
                          bookingId: "booking_101",
                          status: "cancelled_by_guest",
                          cancelledBy: "guest",
                          reason: "Change of plans",
                          refundAmount: 0.00,
                          refundStatus: "not_applicable",
                          cancelledAt: "2026-04-08T14:00:00Z"
                        }
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
                description: "Booking not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "404 — booking ID does not exist",
                        value: { code: "BOOKING_NOT_FOUND", message: "No booking found with ID booking_999." }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Unprocessable — booking cannot be cancelled in its current state",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyCancelled: {
                        summary: "422 — booking is already cancelled",
                        value: { code: "ALREADY_CANCELLED", message: "Booking booking_101 has already been cancelled." }
                      },
                      alreadyCompleted: {
                        summary: "422 — stay is already completed, cannot cancel",
                        value: { code: "BOOKING_COMPLETED", message: "Booking booking_101 has already been completed and cannot be cancelled." }
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

          BookingCreateRequest: {
            type: "object",
            properties: {
              listingId: { type: "string", example: "listing_nyc_001" },
              guestId: { type: "string", example: "cust001" },
              hostId: { type: "string", example: "host123" },
              checkIn: { type: "string", format: "date", example: "2026-04-10" },
              checkOut: { type: "string", format: "date", example: "2026-04-14" },
              guests: {
                type: "object",
                properties: {
                  adults: { type: "integer", example: 2 },
                  children: { type: "integer", example: 1 },
                  infants: { type: "integer", example: 0 }
                }
              },
              totalPrice: { type: "number", format: "float", example: 520.00 },
              currency: { type: "string", example: "USD" },
              specialRequests: { type: "string", example: "Early check-in if possible" }
            }
          },

          Booking: {
            type: "object",
            properties: {
              bookingId: { type: "string", example: "booking_101" },
              listingId: { type: "string", example: "listing_nyc_001" },
              guestId: { type: "string", example: "cust001" },
              hostId: { type: "string", example: "host123" },
              checkIn: { type: "string", format: "date", example: "2026-04-10" },
              checkOut: { type: "string", format: "date", example: "2026-04-14" },
              nights: { type: "integer", example: 4 },
              guests: {
                type: "object",
                properties: {
                  adults: { type: "integer", example: 2 },
                  children: { type: "integer", example: 1 },
                  infants: { type: "integer", example: 0 }
                }
              },
              totalPrice: { type: "number", format: "float", example: 520.00 },
              currency: { type: "string", example: "USD" },
              status: {
                type: "string",
                enum: ["pending_approval", "confirmed", "checked_in", "checked_out", "completed", "cancelled_by_guest", "cancelled_by_host", "declined"],
                example: "confirmed"
              },
              specialRequests: { type: "string", example: "Early check-in if possible" },
              createdAt: { type: "string", format: "date-time", example: "2026-03-01T12:00:00Z" },
              updatedAt: { type: "string", format: "date-time", example: "2026-03-02T09:00:00Z" }
            }
          },

          BookingListResponse: {
            type: "object",
            properties: {
              guestId: { type: "string", example: "cust001" },
              hostId: { type: "string", example: "host123" },
              bookings: { type: "array", items: { $ref: "#/components/schemas/Booking" } },
              totalCount: { type: "integer", example: 3 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 }
            }
          },

          BookingStatusTimeline: {
            type: "object",
            properties: {
              status: { type: "string", example: "confirmed" },
              timestamp: { type: "string", format: "date-time", example: "2026-03-02T09:00:00Z" },
              note: { type: "string", example: "Host approved the booking request" }
            }
          },

          BookingStatusResponse: {
            type: "object",
            properties: {
              bookingId: { type: "string", example: "booking_101" },
              currentStatus: {
                type: "string",
                enum: ["pending_approval", "confirmed", "checked_in", "checked_out", "completed", "cancelled_by_guest", "cancelled_by_host", "declined"],
                example: "confirmed"
              },
              timeline: { type: "array", items: { $ref: "#/components/schemas/BookingStatusTimeline" } },
              nextExpectedStatus: { type: "string", example: "checked_in", nullable: true },
              nextActionDue: { type: "string", format: "date", example: "2026-04-10", nullable: true }
            }
          },

          BookingStatusUpdateRequest: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["confirmed", "declined", "checked_in", "checked_out", "completed", "cancelled_by_guest", "cancelled_by_host"],
                example: "confirmed"
              },
              note: { type: "string", example: "Welcome! Looking forward to hosting you." }
            }
          },

          BookingModifyRequest: {
            type: "object",
            properties: {
              requestedBy: { type: "string", enum: ["guest", "host"], example: "guest" },
              checkIn: { type: "string", format: "date", example: "2026-04-10" },
              checkOut: { type: "string", format: "date", example: "2026-04-15" },
              guests: {
                type: "object",
                properties: {
                  adults: { type: "integer", example: 2 },
                  children: { type: "integer", example: 1 },
                  infants: { type: "integer", example: 0 }
                }
              },
              newTotalPrice: { type: "number", format: "float", example: 650.00 },
              reason: { type: "string", example: "We'd like to extend our stay by one more night" }
            }
          },

          BookingModifyResponse: {
            type: "object",
            properties: {
              bookingId: { type: "string", example: "booking_101" },
              modificationId: { type: "string", example: "mod_001" },
              status: { type: "string", enum: ["pending_approval", "accepted", "declined"], example: "pending_approval" },
              requestedBy: { type: "string", example: "guest" },
              changes: { type: "object", example: { checkIn: "2026-04-10", checkOut: "2026-04-15", newTotalPrice: 650.00 } },
              reason: { type: "string", example: "We'd like to extend our stay by one more night" },
              requestedAt: { type: "string", format: "date-time", example: "2026-03-10T08:00:00Z" }
            }
          },

          CancellationRequest: {
            type: "object",
            properties: {
              cancelledBy: { type: "string", enum: ["guest", "host"], example: "guest" },
              reason: { type: "string", example: "Change of plans" },
              refundRequested: { type: "boolean", example: true }
            }
          },

          CancellationResponse: {
            type: "object",
            properties: {
              bookingId: { type: "string", example: "booking_101" },
              status: { type: "string", enum: ["cancelled_by_guest", "cancelled_by_host"], example: "cancelled_by_guest" },
              cancelledBy: { type: "string", example: "guest" },
              reason: { type: "string", example: "Change of plans" },
              refundAmount: { type: "number", format: "float", example: 520.00 },
              refundStatus: { type: "string", enum: ["pending", "processed", "not_applicable"], example: "pending" },
              cancelledAt: { type: "string", format: "date-time", example: "2026-03-15T10:00:00Z" }
            }
          },

          ErrorResponse: {
            type: "object",
            properties: {
              code: { type: "string", example: "BOOKING_NOT_FOUND" },
              message: { type: "string", example: "No booking found with ID booking_999" }
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
