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
        // BOOKING CREATION & CORE
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
                description: "Booking created",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Booking" },
                    examples: {
                      pendingApproval: {
                        summary: "Booking created — awaiting host approval",
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
                        summary: "Booking created — instant book confirmed",
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
              }
            }
          }
        },

        "/bookings/{bookingId}": {
          get: {
            tags: ["Booking Core"],
            summary: "Get full details of a booking",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" }
            ],
            responses: {
              "200": {
                description: "Booking details",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Booking" },
                    examples: {
                      confirmed: {
                        summary: "GET /bookings/booking_101 — confirmed booking",
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
                        summary: "GET /bookings/booking_101 — guest has checked in",
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
              "404": {
                description: "Booking not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Booking ID does not exist",
                        value: { code: "BOOKING_NOT_FOUND", message: "No booking found with ID booking_999" }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // BOOKING STATUS TRACKING
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
                description: "Booking status with timeline",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingStatusResponse" },
                    examples: {
                      confirmedStatus: {
                        summary: "GET /bookings/booking_101/status — confirmed, upcoming stay",
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
                        summary: "GET /bookings/booking_101/status — guest currently staying",
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
                        summary: "GET /bookings/booking_101/status — stay completed",
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
              }
            }
          },
          patch: {
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
                      summary: "PATCH /bookings/booking_101/status — host approves",
                      value: { status: "confirmed", note: "Welcome! Looking forward to hosting you." }
                    },
                    hostDeclines: {
                      summary: "PATCH /bookings/booking_101/status — host declines",
                      value: { status: "declined", note: "Property unavailable due to unexpected maintenance." }
                    },
                    guestCancels: {
                      summary: "PATCH /bookings/booking_101/status — guest cancels",
                      value: { status: "cancelled_by_guest", note: "Travel plans changed." }
                    },
                    checkIn: {
                      summary: "PATCH /bookings/booking_101/status — guest checks in",
                      value: { status: "checked_in", note: "Guest checked in via smart lock code" }
                    },
                    checkOut: {
                      summary: "PATCH /bookings/booking_101/status — guest checks out",
                      value: { status: "checked_out", note: "Guest checked out on time" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Status updated",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingStatusResponse" },
                    examples: {
                      nowConfirmed: {
                        summary: "Status updated to confirmed",
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
              "422": {
                description: "Invalid status transition",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidTransition: {
                        summary: "Cannot move from completed to checked_in",
                        value: { code: "INVALID_STATUS_TRANSITION", message: "Cannot transition from 'completed' to 'checked_in'." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // GUEST BOOKING HISTORY
        // ─────────────────────────────────────────

        "/guests/{guestId}/bookings": {
          get: {
            tags: ["Guest Booking History"],
            summary: "List all bookings made by a guest",
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
                description: "Guest booking history",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingListResponse" },
                    examples: {
                      allBookings: {
                        summary: "GET /guests/cust001/bookings — full history",
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
                        summary: "GET /guests/cust001/bookings?status=confirmed",
                        value: {
                          guestId: "cust001",
                          bookings: [
                            { bookingId: "booking_101", listingId: "listing_nyc_001", checkIn: "2026-04-10", checkOut: "2026-04-14", nights: 4, totalPrice: 520.00, currency: "USD", status: "confirmed" }
                          ],
                          totalCount: 1,
                          page: 1,
                          limit: 10
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/guests/{guestId}/bookings/upcoming": {
          get: {
            tags: ["Guest Booking History"],
            summary: "Get upcoming bookings for a guest",
            description: "Returns only confirmed or checked_in bookings with a future check-in or active stay — used for the guest's trip dashboard.",
            parameters: [
              { name: "guestId", in: "path", required: true, schema: { type: "string" }, example: "cust001" }
            ],
            responses: {
              "200": {
                description: "Upcoming trips",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingListResponse" },
                    examples: {
                      upcoming: {
                        summary: "GET /guests/cust001/bookings/upcoming",
                        value: {
                          guestId: "cust001",
                          bookings: [
                            { bookingId: "booking_101", listingId: "listing_nyc_001", checkIn: "2026-04-10", checkOut: "2026-04-14", nights: 4, totalPrice: 520.00, currency: "USD", status: "confirmed" },
                            { bookingId: "booking_105", listingId: "listing_boston_002", checkIn: "2026-06-20", checkOut: "2026-06-23", nights: 3, totalPrice: 360.00, currency: "USD", status: "confirmed" }
                          ],
                          totalCount: 2,
                          page: 1,
                          limit: 10
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/guests/{guestId}/bookings/past": {
          get: {
            tags: ["Guest Booking History"],
            summary: "Get past (completed) bookings for a guest",
            description: "Returns all completed stays — used for the guest's travel history and to prompt reviews.",
            parameters: [
              { name: "guestId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Past trips",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingListResponse" },
                    examples: {
                      pastTrips: {
                        summary: "GET /guests/cust001/bookings/past",
                        value: {
                          guestId: "cust001",
                          bookings: [
                            { bookingId: "booking_090", listingId: "listing_miami_003", checkIn: "2026-02-14", checkOut: "2026-02-17", nights: 3, totalPrice: 390.00, currency: "USD", status: "completed" },
                            { bookingId: "booking_075", listingId: "listing_chicago_011", checkIn: "2025-12-20", checkOut: "2025-12-25", nights: 5, totalPrice: 610.00, currency: "USD", status: "completed" }
                          ],
                          totalCount: 2,
                          page: 1,
                          limit: 10
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // HOST BOOKING HISTORY
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
                description: "Host booking list",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingListResponse" },
                    examples: {
                      pendingRequests: {
                        summary: "GET /hosts/host123/bookings?status=pending_approval",
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
                        summary: "GET /hosts/host123/bookings — full history",
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
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // CHECK-IN / CHECK-OUT
        // ─────────────────────────────────────────

        "/bookings/{bookingId}/check-in": {
          post: {
            tags: ["Check-in & Check-out"],
            summary: "Record guest check-in",
            description: "Marks the guest as checked in. Can be triggered by the host, guest self-check-in, or smart lock system. Transitions booking from 'confirmed' to 'checked_in'.",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CheckInRequest" },
                  examples: {
                    selfCheckIn: {
                      summary: "POST /bookings/booking_101/check-in — guest self check-in",
                      value: { method: "self_checkin", note: "Guest used the lockbox code", checkedInAt: "2026-04-10T15:30:00Z" }
                    },
                    hostCheckIn: {
                      summary: "POST /bookings/booking_101/check-in — host greets guest",
                      value: { method: "host_greeting", note: "Host met guest at the door", checkedInAt: "2026-04-10T14:00:00Z" }
                    },
                    smartLock: {
                      summary: "POST /bookings/booking_101/check-in — smart lock auto check-in",
                      value: { method: "smart_lock", note: "Smart lock access granted at door", checkedInAt: "2026-04-10T16:00:00Z" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Check-in recorded",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/CheckInOutResponse" },
                    examples: {
                      checkedIn: {
                        summary: "Guest successfully checked in",
                        value: {
                          bookingId: "booking_101",
                          status: "checked_in",
                          method: "self_checkin",
                          note: "Guest used the lockbox code",
                          timestamp: "2026-04-10T15:30:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Check-in conflict",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyCheckedIn: {
                        summary: "Guest already checked in",
                        value: { code: "ALREADY_CHECKED_IN", message: "Booking booking_101 is already in checked_in status." }
                      },
                      tooEarly: {
                        summary: "Check-in before allowed window",
                        value: { code: "CHECKIN_TOO_EARLY", message: "Check-in is not allowed before 2026-04-10T14:00:00Z." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/bookings/{bookingId}/check-out": {
          post: {
            tags: ["Check-in & Check-out"],
            summary: "Record guest check-out",
            description: "Marks the guest as checked out. Transitions booking from 'checked_in' to 'checked_out', then the system auto-completes and schedules host payout.",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CheckOutRequest" },
                  examples: {
                    onTime: {
                      summary: "POST /bookings/booking_101/check-out — on time",
                      value: { note: "Guest left on time, property in good condition", checkedOutAt: "2026-04-14T11:00:00Z" }
                    },
                    lateCheckOut: {
                      summary: "POST /bookings/booking_101/check-out — late checkout approved",
                      value: { note: "Host approved late checkout until 1PM", checkedOutAt: "2026-04-14T13:00:00Z" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Check-out recorded",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/CheckInOutResponse" },
                    examples: {
                      checkedOut: {
                        summary: "Guest successfully checked out",
                        value: {
                          bookingId: "booking_101",
                          status: "checked_out",
                          note: "Guest left on time, property in good condition",
                          timestamp: "2026-04-14T11:00:00Z"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // BOOKING MODIFICATIONS
        // ─────────────────────────────────────────

        "/bookings/{bookingId}/modify": {
          patch: {
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
                      summary: "PATCH /bookings/booking_101/modify — extend stay by 1 night",
                      value: {
                        requestedBy: "guest",
                        checkIn: "2026-04-10",
                        checkOut: "2026-04-15",
                        newTotalPrice: 650.00,
                        reason: "We'd like to extend our stay by one more night"
                      }
                    },
                    reduceDates: {
                      summary: "PATCH /bookings/booking_101/modify — shorten stay",
                      value: {
                        requestedBy: "guest",
                        checkIn: "2026-04-11",
                        checkOut: "2026-04-14",
                        newTotalPrice: 390.00,
                        reason: "Arriving one day later due to flight change"
                      }
                    },
                    updateGuests: {
                      summary: "PATCH /bookings/booking_101/modify — update guest count",
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
                description: "Modification request submitted",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingModifyResponse" },
                    examples: {
                      modificationPending: {
                        summary: "Modification awaiting host approval",
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
              }
            }
          }
        },

        "/bookings/{bookingId}/modify/{modificationId}/accept": {
          post: {
            tags: ["Booking Modifications"],
            summary: "Accept a modification request",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" },
              { name: "modificationId", in: "path", required: true, schema: { type: "string" }, example: "mod_001" }
            ],
            responses: {
              "200": {
                description: "Modification accepted and applied",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Booking" },
                    examples: {
                      accepted: {
                        summary: "POST /bookings/booking_101/modify/mod_001/accept — host accepts extension",
                        value: {
                          bookingId: "booking_101",
                          listingId: "listing_nyc_001",
                          guestId: "cust001",
                          hostId: "host123",
                          checkIn: "2026-04-10",
                          checkOut: "2026-04-15",
                          nights: 5,
                          guests: { adults: 2, children: 1, infants: 0 },
                          totalPrice: 650.00,
                          currency: "USD",
                          status: "confirmed",
                          specialRequests: "Early check-in if possible",
                          createdAt: "2026-03-01T12:00:00Z",
                          updatedAt: "2026-03-10T09:00:00Z"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/bookings/{bookingId}/modify/{modificationId}/decline": {
          post: {
            tags: ["Booking Modifications"],
            summary: "Decline a modification request",
            parameters: [
              { name: "bookingId", in: "path", required: true, schema: { type: "string" }, example: "booking_101" },
              { name: "modificationId", in: "path", required: true, schema: { type: "string" }, example: "mod_001" }
            ],
            requestBody: {
              required: false,
              content: {
                "application/json": {
                  schema: { type: "object", properties: { reason: { type: "string" } } },
                  examples: {
                    hostDeclines: {
                      summary: "POST /bookings/booking_101/modify/mod_001/decline",
                      value: { reason: "The property is already booked for the additional night requested." }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Modification declined, booking unchanged",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingModifyResponse" },
                    examples: {
                      declined: {
                        summary: "Modification declined",
                        value: {
                          bookingId: "booking_101",
                          modificationId: "mod_001",
                          status: "declined",
                          requestedBy: "guest",
                          changes: { checkIn: "2026-04-10", checkOut: "2026-04-15", newTotalPrice: 650.00 },
                          reason: "The property is already booked for the additional night requested.",
                          requestedAt: "2026-03-10T08:00:00Z"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // CANCELLATIONS
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
                      summary: "POST /bookings/booking_101/cancel — guest cancels (free window)",
                      value: { cancelledBy: "guest", reason: "Change of plans", refundRequested: true }
                    },
                    hostCancels: {
                      summary: "POST /bookings/booking_101/cancel — host cancels",
                      value: { cancelledBy: "host", reason: "Unexpected property damage requiring repairs", refundRequested: false }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Booking cancelled",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/CancellationResponse" },
                    examples: {
                      fullRefund: {
                        summary: "Cancelled with full refund (within free window)",
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
                        summary: "Host cancelled — guest gets full refund automatically",
                        value: {
                          bookingId: "booking_101",
                          status: "cancelled_by_host",
                          cancelledBy: "host",
                          reason: "Unexpected property damage requiring repairs",
                          refundAmount: 520.00,
                          refundStatus: "pending",
                          cancelledAt: "2026-03-16T07:00:00Z"
                        }
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

          CheckInRequest: {
            type: "object",
            properties: {
              method: { type: "string", enum: ["self_checkin", "host_greeting", "smart_lock", "keypad"], example: "self_checkin" },
              note: { type: "string", example: "Guest used the lockbox code" },
              checkedInAt: { type: "string", format: "date-time", example: "2026-04-10T15:30:00Z" }
            }
          },

          CheckOutRequest: {
            type: "object",
            properties: {
              note: { type: "string", example: "Guest left on time, property in good condition" },
              checkedOutAt: { type: "string", format: "date-time", example: "2026-04-14T11:00:00Z" }
            }
          },

          CheckInOutResponse: {
            type: "object",
            properties: {
              bookingId: { type: "string", example: "booking_101" },
              status: { type: "string", example: "checked_in" },
              method: { type: "string", example: "self_checkin", nullable: true },
              note: { type: "string", example: "Guest used the lockbox code" },
              timestamp: { type: "string", format: "date-time", example: "2026-04-10T15:30:00Z" }
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
