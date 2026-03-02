window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: {
      openapi: "3.0.3",
      info: {
        title: "Admin Dispute Resolution API",
        version: "1.0.0",
        description: "APIs for guests and hosts to raise disputes, submit evidence, and communicate — and for platform admins to investigate, assign cases, make rulings, issue refunds or penalties, and close dispute cases on the Airbnb platform."
      },
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "http://localhost:3000", description: "Local dev" }
      ],
      security: [{ bearerAuth: [] }],
      paths: {

        // ─────────────────────────────────────────
        // 1 & 2. RAISE A DISPUTE / LIST ALL DISPUTES
        // ─────────────────────────────────────────

        "/disputes": {
          post: {
            tags: ["Disputes"],
            summary: "Raise a new dispute",
            description: "Allows a guest or host to open a formal dispute against the other party regarding a booking. Disputes can cover refund claims, property damage, misrepresentation, cancellation disagreements, and more. Once raised, the platform admin team is notified.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DisputeCreateRequest" },
                  examples: {
                    guestRaisesRefundDispute: {
                      summary: "POST /disputes — guest disputes a denied refund",
                      value: {
                        bookingId: "booking_101",
                        raisedBy: "cust001",
                        raisedByRole: "guest",
                        againstUserId: "host123",
                        againstUserRole: "host",
                        category: "refund_dispute",
                        subject: "Host refused refund after cancelling booking",
                        description: "The host cancelled my booking 2 days before check-in due to a claimed emergency, but then declined my refund request saying the cancellation policy did not apply. I paid $520 and have received nothing back. The platform's policy clearly states guests receive a full refund when the host cancels.",
                        claimedAmount: 520.00,
                        currency: "USD"
                      }
                    },
                    hostRaisesPropertyDamageDispute: {
                      summary: "POST /disputes — host claims property damage by guest",
                      value: {
                        bookingId: "booking_098",
                        raisedBy: "host123",
                        raisedByRole: "host",
                        againstUserId: "cust004",
                        againstUserRole: "guest",
                        category: "property_damage",
                        subject: "Significant damage to apartment furniture after guest stay",
                        description: "After the guest's 3-night stay, I discovered a broken sofa leg, a large stain on the carpet, and a cracked mirror in the bathroom. The estimated repair and replacement cost is $380. The guest is refusing to acknowledge the damage or pay for repairs.",
                        claimedAmount: 380.00,
                        currency: "USD"
                      }
                    },
                    guestRaisesMisrepresentation: {
                      summary: "POST /disputes — guest claims listing was misrepresented",
                      value: {
                        bookingId: "booking_103",
                        raisedBy: "cust005",
                        raisedByRole: "guest",
                        againstUserId: "host456",
                        againstUserRole: "host",
                        category: "listing_misrepresentation",
                        subject: "Listing photos and description did not match actual property",
                        description: "The listing showed a private apartment but on arrival it was a shared room in a shared flat with strangers. The amenities listed including a pool and gym were not available. I had no choice but to book alternative accommodation and I am requesting a full refund of $280.",
                        claimedAmount: 280.00,
                        currency: "USD"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Dispute raised successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Dispute" },
                    examples: {
                      created: {
                        summary: "Dispute opened and under admin review",
                        value: {
                          disputeId: "disp_001",
                          bookingId: "booking_101",
                          raisedBy: "cust001",
                          raisedByRole: "guest",
                          againstUserId: "host123",
                          againstUserRole: "host",
                          category: "refund_dispute",
                          subject: "Host refused refund after cancelling booking",
                          description: "The host cancelled my booking 2 days before check-in...",
                          claimedAmount: 520.00,
                          currency: "USD",
                          status: "open",
                          priority: "normal",
                          assignedAdminId: null,
                          resolution: null,
                          createdAt: "2026-03-05T09:00:00Z",
                          updatedAt: "2026-03-05T09:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Dispute already exists for this booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyExists: {
                        summary: "Duplicate dispute attempt",
                        value: { code: "DISPUTE_ALREADY_EXISTS", message: "An open dispute already exists for booking booking_101. Dispute ID: disp_001" }
                      }
                    }
                  }
                }
              }
            }
          },

          get: {
            tags: ["Disputes"],
            summary: "List all disputes (admin only)",
            description: "Returns a paginated list of all disputes on the platform. Admin-only endpoint. Supports filtering by status, category, priority, and date range.",
            parameters: [
              {
                name: "status", in: "query", required: false,
                schema: { type: "string", enum: ["open", "under_review", "awaiting_evidence", "resolved", "closed", "escalated"] },
                example: "open"
              },
              {
                name: "category", in: "query", required: false,
                schema: { type: "string", enum: ["refund_dispute", "property_damage", "listing_misrepresentation", "cancellation_dispute", "harassment", "payment_issue", "other"] },
                example: "refund_dispute"
              },
              {
                name: "priority", in: "query", required: false,
                schema: { type: "string", enum: ["low", "normal", "high", "urgent"] },
                example: "high"
              },
              { name: "assignedAdminId", in: "query", required: false, schema: { type: "string" }, example: "admin_007" },
              { name: "start", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-01" },
              { name: "end", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-31" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 20 }, example: 20 }
            ],
            responses: {
              "200": {
                description: "List of disputes",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/DisputeListResponse" },
                    examples: {
                      openDisputes: {
                        summary: "GET /disputes?status=open&priority=high",
                        value: {
                          totalCount: 3,
                          page: 1,
                          limit: 20,
                          disputes: [
                            {
                              disputeId: "disp_001",
                              bookingId: "booking_101",
                              raisedByRole: "guest",
                              againstUserRole: "host",
                              category: "refund_dispute",
                              subject: "Host refused refund after cancelling booking",
                              claimedAmount: 520.00,
                              currency: "USD",
                              status: "open",
                              priority: "high",
                              assignedAdminId: null,
                              createdAt: "2026-03-05T09:00:00Z"
                            },
                            {
                              disputeId: "disp_003",
                              bookingId: "booking_103",
                              raisedByRole: "guest",
                              againstUserRole: "host",
                              category: "listing_misrepresentation",
                              subject: "Listing photos and description did not match actual property",
                              claimedAmount: 280.00,
                              currency: "USD",
                              status: "open",
                              priority: "high",
                              assignedAdminId: null,
                              createdAt: "2026-03-06T11:00:00Z"
                            }
                          ]
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
        // 3. DISPUTE DETAIL
        // ─────────────────────────────────────────

        "/disputes/{disputeId}": {
          get: {
            tags: ["Disputes"],
            summary: "Get full details of a dispute",
            description: "Returns the complete dispute record including all submitted evidence, the message thread, admin notes, and any resolution details.",
            parameters: [
              { name: "disputeId", in: "path", required: true, schema: { type: "string" }, example: "disp_001" }
            ],
            responses: {
              "200": {
                description: "Dispute details",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/DisputeDetail" },
                    examples: {
                      underReview: {
                        summary: "GET /disputes/disp_001 — dispute under admin review",
                        value: {
                          disputeId: "disp_001",
                          bookingId: "booking_101",
                          raisedBy: "cust001",
                          raisedByRole: "guest",
                          againstUserId: "host123",
                          againstUserRole: "host",
                          category: "refund_dispute",
                          subject: "Host refused refund after cancelling booking",
                          description: "The host cancelled my booking 2 days before check-in but declined my refund request saying cancellation policy did not apply.",
                          claimedAmount: 520.00,
                          currency: "USD",
                          status: "under_review",
                          priority: "high",
                          assignedAdminId: "admin_007",
                          adminNotes: "Booking cancellation confirmed on system. Host initiated cancel 48h before check-in. Platform policy mandates full guest refund. Awaiting host response to evidence request.",
                          evidence: [
                            { evidenceId: "evid_001", submittedBy: "cust001", role: "guest", type: "screenshot", description: "Screenshot of host cancellation notification", fileUrl: "https://cdn.example.com/disputes/disp_001/evid_001.png", submittedAt: "2026-03-05T09:30:00Z" },
                            { evidenceId: "evid_002", submittedBy: "cust001", role: "guest", type: "screenshot", description: "Screenshot of refund request being declined by host", fileUrl: "https://cdn.example.com/disputes/disp_001/evid_002.png", submittedAt: "2026-03-05T09:31:00Z" }
                          ],
                          messages: [
                            { messageId: "msg_001", sentBy: "cust001", role: "guest", message: "I have submitted my screenshots. Please review as soon as possible.", sentAt: "2026-03-05T09:35:00Z" },
                            { messageId: "msg_002", sentBy: "admin_007", role: "admin", message: "Thank you for submitting your evidence. We have reviewed the cancellation record on our system and have reached out to the host to provide their response. We aim to resolve this within 5 business days.", sentAt: "2026-03-06T10:00:00Z" }
                          ],
                          resolution: null,
                          createdAt: "2026-03-05T09:00:00Z",
                          updatedAt: "2026-03-06T10:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Dispute not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Dispute does not exist",
                        value: { code: "DISPUTE_NOT_FOUND", message: "No dispute found with ID disp_999" }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 4. EVIDENCE SUBMISSION
        // ─────────────────────────────────────────

        "/disputes/{disputeId}/evidence": {
          post: {
            tags: ["Evidence"],
            summary: "Submit evidence for a dispute",
            description: "Allows either the guest, host, or admin to attach supporting evidence to a dispute — screenshots, photos, receipts, messages, or documents. Both parties can submit evidence during the active dispute window.",
            parameters: [
              { name: "disputeId", in: "path", required: true, schema: { type: "string" }, example: "disp_001" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/EvidenceSubmitRequest" },
                  examples: {
                    guestScreenshot: {
                      summary: "POST /disputes/disp_001/evidence — guest submits screenshot",
                      value: {
                        submittedBy: "cust001",
                        role: "guest",
                        type: "screenshot",
                        description: "Screenshot showing host cancellation message and timestamp",
                        fileUrl: "https://cdn.example.com/disputes/disp_001/evid_001.png"
                      }
                    },
                    hostDamagePhoto: {
                      summary: "POST /disputes/disp_002/evidence — host submits damage photos",
                      value: {
                        submittedBy: "host123",
                        role: "host",
                        type: "photo",
                        description: "Photos of broken sofa and carpet stain taken the morning after checkout",
                        fileUrl: "https://cdn.example.com/disputes/disp_002/damage_photo_1.jpg"
                      }
                    },
                    guestReceipt: {
                      summary: "POST /disputes/disp_001/evidence — guest submits payment receipt",
                      value: {
                        submittedBy: "cust001",
                        role: "guest",
                        type: "receipt",
                        description: "Payment confirmation receipt showing $520.00 charged on 2026-03-01",
                        fileUrl: "https://cdn.example.com/disputes/disp_001/receipt.pdf"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Evidence submitted",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Evidence" },
                    examples: {
                      submitted: {
                        summary: "Evidence accepted and attached to dispute",
                        value: {
                          evidenceId: "evid_003",
                          disputeId: "disp_001",
                          submittedBy: "cust001",
                          role: "guest",
                          type: "screenshot",
                          description: "Screenshot showing host cancellation message and timestamp",
                          fileUrl: "https://cdn.example.com/disputes/disp_001/evid_001.png",
                          submittedAt: "2026-03-05T09:30:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Evidence submission not allowed — dispute is closed or resolved",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      closedDispute: {
                        summary: "Cannot submit evidence on resolved dispute",
                        value: { code: "DISPUTE_CLOSED", message: "Evidence can no longer be submitted. Dispute disp_001 has already been resolved." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 5. DISPUTE MESSAGING
        // ─────────────────────────────────────────

        "/disputes/{disputeId}/messages": {
          post: {
            tags: ["Messaging"],
            summary: "Send a message in a dispute thread",
            description: "Allows the guest, host, or admin to post a message into the dispute thread. Used for clarifications, follow-up questions, and admin communications. The full message thread is returned as part of GET /disputes/{disputeId}.",
            parameters: [
              { name: "disputeId", in: "path", required: true, schema: { type: "string" }, example: "disp_001" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MessageSendRequest" },
                  examples: {
                    guestMessage: {
                      summary: "POST /disputes/disp_001/messages — guest sends follow-up",
                      value: { sentBy: "cust001", role: "guest", message: "I have submitted my screenshots. Please review as soon as possible." }
                    },
                    adminMessage: {
                      summary: "POST /disputes/disp_001/messages — admin requests more info from host",
                      value: { sentBy: "admin_007", role: "admin", message: "We have reviewed the guest's evidence. We are requesting the host provide documentation of the emergency cancellation or confirmation of their refund policy stance within 48 hours." }
                    },
                    hostMessage: {
                      summary: "POST /disputes/disp_001/messages — host responds",
                      value: { sentBy: "host123", role: "host", message: "I cancelled due to a family emergency and was not aware the automatic refund policy applied. I am happy to cooperate with whatever the admin decides." }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Message sent",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Message" },
                    examples: {
                      sent: {
                        summary: "Message posted to thread",
                        value: {
                          messageId: "msg_005",
                          disputeId: "disp_001",
                          sentBy: "cust001",
                          role: "guest",
                          message: "I have submitted my screenshots. Please review as soon as possible.",
                          sentAt: "2026-03-05T09:35:00Z"
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
        // 6. ASSIGN DISPUTE TO ADMIN
        // ─────────────────────────────────────────

        "/disputes/{disputeId}/assign": {
          put: {
            tags: ["Admin Actions"],
            summary: "Assign a dispute to an admin",
            description: "Assigns the dispute case to a specific admin agent for investigation. Also updates the dispute status to under_review and sets the priority level.",
            parameters: [
              { name: "disputeId", in: "path", required: true, schema: { type: "string" }, example: "disp_001" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AssignRequest" },
                  examples: {
                    assign: {
                      summary: "PUT /disputes/disp_001/assign — assign to admin and set priority",
                      value: { adminId: "admin_007", priority: "high", note: "High-value booking involving full refund claim. Policy clearly favours guest — expedite." }
                    },
                    escalate: {
                      summary: "PUT /disputes/disp_001/assign — escalate to senior admin",
                      value: { adminId: "admin_001", priority: "urgent", note: "Escalated due to unresolved harassment claim. Senior review required." }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Dispute assigned",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Dispute" },
                    examples: {
                      assigned: {
                        summary: "Dispute assigned to admin_007",
                        value: {
                          disputeId: "disp_001",
                          bookingId: "booking_101",
                          status: "under_review",
                          priority: "high",
                          assignedAdminId: "admin_007",
                          updatedAt: "2026-03-06T08:00:00Z"
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
        // 7. RESOLVE DISPUTE
        // ─────────────────────────────────────────

        "/disputes/{disputeId}/resolve": {
          post: {
            tags: ["Admin Actions"],
            summary: "Resolve a dispute with a ruling",
            description: "Admin issues the final ruling on a dispute. The resolution specifies who the decision favours, the action taken (full refund, partial refund, no refund, penalty issued), the amount if applicable, and a written explanation. Triggers any associated payment actions automatically.",
            parameters: [
              { name: "disputeId", in: "path", required: true, schema: { type: "string" }, example: "disp_001" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ResolveRequest" },
                  examples: {
                    fullRefundToGuest: {
                      summary: "POST /disputes/disp_001/resolve — full refund ruled in guest's favour",
                      value: {
                        resolvedBy: "admin_007",
                        decisionFavours: "guest",
                        outcome: "full_refund",
                        refundAmount: 520.00,
                        currency: "USD",
                        penaltyIssuedTo: null,
                        penaltyAmount: null,
                        explanation: "After reviewing the booking history, cancellation records, and platform policy, we confirm the host cancelled the booking 48 hours before check-in. Under our Host Cancellation Policy, the guest is entitled to a full refund of $520.00. The refund will be processed within 3-5 business days. The host's cancellation record has been noted."
                      }
                    },
                    partialRefundCompromise: {
                      summary: "POST /disputes/disp_002/resolve — partial refund compromise for damage dispute",
                      value: {
                        resolvedBy: "admin_007",
                        decisionFavours: "both",
                        outcome: "partial_refund",
                        refundAmount: 190.00,
                        currency: "USD",
                        penaltyIssuedTo: "cust004",
                        penaltyAmount: 190.00,
                        explanation: "Evidence from both parties has been reviewed. Photos submitted by the host confirm damage occurred. However, the pre-existing condition of the carpet was noted in the previous guest's review, making full attribution to this guest unreasonable. A compromise of $190.00 has been determined — charged to the guest and remitted to the host."
                      }
                    },
                    noActionHostFavoured: {
                      summary: "POST /disputes/disp_003/resolve — host favoured, no refund",
                      value: {
                        resolvedBy: "admin_001",
                        decisionFavours: "host",
                        outcome: "no_refund",
                        refundAmount: 0,
                        currency: "USD",
                        penaltyIssuedTo: null,
                        penaltyAmount: null,
                        explanation: "The guest's claim that the listing was misrepresented has been reviewed against the listing photos, description, and booking communications. The listing accurately described the shared accommodation arrangement. The guest acknowledged the property type at the time of booking. The refund request has been declined."
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Dispute resolved",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/DisputeResolution" },
                    examples: {
                      resolved: {
                        summary: "Dispute resolved — full refund to guest",
                        value: {
                          disputeId: "disp_001",
                          resolvedBy: "admin_007",
                          decisionFavours: "guest",
                          outcome: "full_refund",
                          refundAmount: 520.00,
                          currency: "USD",
                          penaltyIssuedTo: null,
                          penaltyAmount: null,
                          explanation: "Host cancelled 48 hours before check-in. Full refund of $520.00 issued under Host Cancellation Policy.",
                          status: "resolved",
                          resolvedAt: "2026-03-08T09:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Cannot resolve — dispute not yet under review or missing evidence",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notReady: {
                        summary: "Dispute not ready for resolution",
                        value: { code: "DISPUTE_NOT_REVIEWABLE", message: "Dispute disp_001 is still awaiting evidence from the host. Resolution cannot be issued yet." }
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

          DisputeCreateRequest: {
            type: "object",
            properties: {
              bookingId: { type: "string", example: "booking_101" },
              raisedBy: { type: "string", example: "cust001" },
              raisedByRole: { type: "string", enum: ["guest", "host"], example: "guest" },
              againstUserId: { type: "string", example: "host123" },
              againstUserRole: { type: "string", enum: ["guest", "host"], example: "host" },
              category: { type: "string", enum: ["refund_dispute", "property_damage", "listing_misrepresentation", "cancellation_dispute", "harassment", "payment_issue", "other"], example: "refund_dispute" },
              subject: { type: "string", example: "Host refused refund after cancelling booking" },
              description: { type: "string", example: "The host cancelled my booking 2 days before check-in..." },
              claimedAmount: { type: "number", format: "float", example: 520.00 },
              currency: { type: "string", example: "USD" }
            }
          },

          Dispute: {
            type: "object",
            properties: {
              disputeId: { type: "string", example: "disp_001" },
              bookingId: { type: "string", example: "booking_101" },
              raisedBy: { type: "string", example: "cust001" },
              raisedByRole: { type: "string", enum: ["guest", "host"], example: "guest" },
              againstUserId: { type: "string", example: "host123" },
              againstUserRole: { type: "string", enum: ["guest", "host"], example: "host" },
              category: { type: "string", example: "refund_dispute" },
              subject: { type: "string", example: "Host refused refund after cancelling booking" },
              description: { type: "string", example: "The host cancelled my booking 2 days before check-in..." },
              claimedAmount: { type: "number", format: "float", example: 520.00 },
              currency: { type: "string", example: "USD" },
              status: { type: "string", enum: ["open", "under_review", "awaiting_evidence", "resolved", "closed", "escalated"], example: "open" },
              priority: { type: "string", enum: ["low", "normal", "high", "urgent"], example: "high" },
              assignedAdminId: { type: "string", example: "admin_007", nullable: true },
              resolution: { $ref: "#/components/schemas/DisputeResolution", nullable: true },
              createdAt: { type: "string", format: "date-time", example: "2026-03-05T09:00:00Z" },
              updatedAt: { type: "string", format: "date-time", example: "2026-03-06T10:00:00Z" }
            }
          },

          DisputeDetail: {
            allOf: [
              { $ref: "#/components/schemas/Dispute" },
              {
                type: "object",
                properties: {
                  adminNotes: { type: "string", example: "Booking cancellation confirmed. Platform policy mandates full guest refund.", nullable: true },
                  evidence: { type: "array", items: { $ref: "#/components/schemas/Evidence" } },
                  messages: { type: "array", items: { $ref: "#/components/schemas/Message" } }
                }
              }
            ]
          },

          DisputeListResponse: {
            type: "object",
            properties: {
              totalCount: { type: "integer", example: 3 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              disputes: { type: "array", items: { $ref: "#/components/schemas/Dispute" } }
            }
          },

          Evidence: {
            type: "object",
            properties: {
              evidenceId: { type: "string", example: "evid_001" },
              disputeId: { type: "string", example: "disp_001" },
              submittedBy: { type: "string", example: "cust001" },
              role: { type: "string", enum: ["guest", "host", "admin"], example: "guest" },
              type: { type: "string", enum: ["screenshot", "photo", "receipt", "document", "video", "other"], example: "screenshot" },
              description: { type: "string", example: "Screenshot showing host cancellation message and timestamp" },
              fileUrl: { type: "string", example: "https://cdn.example.com/disputes/disp_001/evid_001.png" },
              submittedAt: { type: "string", format: "date-time", example: "2026-03-05T09:30:00Z" }
            }
          },

          EvidenceSubmitRequest: {
            type: "object",
            properties: {
              submittedBy: { type: "string", example: "cust001" },
              role: { type: "string", enum: ["guest", "host", "admin"], example: "guest" },
              type: { type: "string", enum: ["screenshot", "photo", "receipt", "document", "video", "other"], example: "screenshot" },
              description: { type: "string", example: "Screenshot showing host cancellation message and timestamp" },
              fileUrl: { type: "string", example: "https://cdn.example.com/disputes/disp_001/evid_001.png" }
            }
          },

          Message: {
            type: "object",
            properties: {
              messageId: { type: "string", example: "msg_001" },
              disputeId: { type: "string", example: "disp_001" },
              sentBy: { type: "string", example: "cust001" },
              role: { type: "string", enum: ["guest", "host", "admin"], example: "guest" },
              message: { type: "string", example: "I have submitted my screenshots. Please review as soon as possible." },
              sentAt: { type: "string", format: "date-time", example: "2026-03-05T09:35:00Z" }
            }
          },

          MessageSendRequest: {
            type: "object",
            properties: {
              sentBy: { type: "string", example: "cust001" },
              role: { type: "string", enum: ["guest", "host", "admin"], example: "guest" },
              message: { type: "string", example: "I have submitted my screenshots. Please review as soon as possible." }
            }
          },

          AssignRequest: {
            type: "object",
            properties: {
              adminId: { type: "string", example: "admin_007" },
              priority: { type: "string", enum: ["low", "normal", "high", "urgent"], example: "high" },
              note: { type: "string", example: "High-value booking. Policy clearly favours guest — expedite." }
            }
          },

          ResolveRequest: {
            type: "object",
            properties: {
              resolvedBy: { type: "string", example: "admin_007" },
              decisionFavours: { type: "string", enum: ["guest", "host", "both", "neither"], example: "guest" },
              outcome: { type: "string", enum: ["full_refund", "partial_refund", "no_refund", "penalty_issued", "warning_issued", "no_action"], example: "full_refund" },
              refundAmount: { type: "number", format: "float", example: 520.00 },
              currency: { type: "string", example: "USD" },
              penaltyIssuedTo: { type: "string", example: null, nullable: true },
              penaltyAmount: { type: "number", format: "float", example: null, nullable: true },
              explanation: { type: "string", example: "Host cancelled 48 hours before check-in. Full refund of $520.00 issued under Host Cancellation Policy." }
            }
          },

          DisputeResolution: {
            type: "object",
            nullable: true,
            properties: {
              disputeId: { type: "string", example: "disp_001" },
              resolvedBy: { type: "string", example: "admin_007" },
              decisionFavours: { type: "string", enum: ["guest", "host", "both", "neither"], example: "guest" },
              outcome: { type: "string", enum: ["full_refund", "partial_refund", "no_refund", "penalty_issued", "warning_issued", "no_action"], example: "full_refund" },
              refundAmount: { type: "number", format: "float", example: 520.00 },
              currency: { type: "string", example: "USD" },
              penaltyIssuedTo: { type: "string", nullable: true, example: null },
              penaltyAmount: { type: "number", format: "float", nullable: true, example: null },
              explanation: { type: "string", example: "Host cancelled 48 hours before check-in. Full refund of $520.00 issued under Host Cancellation Policy." },
              status: { type: "string", enum: ["resolved", "closed"], example: "resolved" },
              resolvedAt: { type: "string", format: "date-time", example: "2026-03-08T09:00:00Z" }
            }
          },

          ErrorResponse: {
            type: "object",
            properties: {
              code: { type: "string", example: "DISPUTE_NOT_FOUND" },
              message: { type: "string", example: "No dispute found with ID disp_999" }
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
