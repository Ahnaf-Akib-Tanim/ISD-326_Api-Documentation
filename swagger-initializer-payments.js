window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: {
      openapi: "3.0.3",
      info: {
        title: "Payment, Host Payout & Financial Management API",
        version: "1.0.0",
        description: "APIs to manage customer payments, host payouts, refunds, earnings, and financial reporting for the Airbnb platform."
      },
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "http://localhost:3000", description: "Local dev" }
      ],
      security: [{ bearerAuth: [] }],
      paths: {

        // ─────────────────────────────────────────
        // CUSTOMER PAYMENTS
        // ─────────────────────────────────────────

        "/payments": {
          post: {
            tags: ["Customer Payments"],
            summary: "Initiate a payment for a booking",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PaymentRequest" },
                  examples: {
                    cardPayment: {
                      summary: "POST /payments — pay by credit card",
                      value: {
                        bookingId: "booking101",
                        customerId: "cust001",
                        amount: 350.00,
                        currency: "USD",
                        method: "credit_card",
                        cardToken: "tok_visa_4242"
                      }
                    },
                    paypalPayment: {
                      summary: "POST /payments — pay via PayPal",
                      value: {
                        bookingId: "booking102",
                        customerId: "cust002",
                        amount: 180.00,
                        currency: "USD",
                        method: "paypal",
                        paypalEmail: "guest@example.com"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Payment initiated successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/PaymentResponse" },
                    examples: {
                      success: {
                        summary: "Payment confirmed",
                        value: {
                          paymentId: "pay_abc123",
                          bookingId: "booking101",
                          customerId: "cust001",
                          amount: 350.00,
                          currency: "USD",
                          status: "completed",
                          method: "credit_card",
                          createdAt: "2026-03-01T10:30:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad Request — missing or invalid fields",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      missingField: {
                        summary: "Missing required field",
                        value: { code: 400, error: "Bad Request", message: "Field 'amount' is required and must be a positive number." }
                      },
                      invalidMethod: {
                        summary: "Unsupported payment method",
                        value: { code: 400, error: "Bad Request", message: "Payment method 'bitcoin' is not supported. Accepted: credit_card, debit_card, paypal, apple_pay, google_pay." }
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorized — missing or invalid bearer token",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      unauthorized: {
                        summary: "No token provided",
                        value: { code: 401, error: "Unauthorized", message: "Authentication token is missing or has expired." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — booking or customer does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      bookingNotFound: {
                        summary: "Booking not found",
                        value: { code: 404, error: "Not Found", message: "Booking 'booking999' does not exist." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Conflict — payment already exists for this booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      duplicate: {
                        summary: "Duplicate payment",
                        value: { code: 409, error: "Conflict", message: "A payment for booking 'booking101' has already been completed." }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Unprocessable Entity — payment declined by provider",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      cardDeclined: {
                        summary: "Card declined",
                        value: { code: 422, error: "Unprocessable Entity", message: "Payment declined: insufficient funds on the provided card." }
                      }
                    }
                  }
                }
              },
              "500": {
                description: "Internal Server Error — payment gateway failure",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      gatewayError: {
                        summary: "Gateway timeout",
                        value: { code: 500, error: "Internal Server Error", message: "Payment gateway did not respond. Please retry after a few moments." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/payments/{paymentId}": {
          get: {
            tags: ["Customer Payments"],
            summary: "Get payment details by ID",
            parameters: [
              { name: "paymentId", in: "path", required: true, schema: { type: "string" }, example: "pay_abc123" }
            ],
            responses: {
              "200": {
                description: "Payment details retrieved successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/PaymentResponse" },
                    examples: {
                      completed: {
                        summary: "GET /payments/pay_abc123 — completed payment",
                        value: {
                          paymentId: "pay_abc123",
                          bookingId: "booking101",
                          customerId: "cust001",
                          amount: 350.00,
                          currency: "USD",
                          status: "completed",
                          method: "credit_card",
                          createdAt: "2026-03-01T10:30:00Z"
                        }
                      },
                      pending: {
                        summary: "GET /payments/pay_def456 — pending payment",
                        value: {
                          paymentId: "pay_def456",
                          bookingId: "booking102",
                          customerId: "cust002",
                          amount: 180.00,
                          currency: "USD",
                          status: "pending",
                          method: "paypal",
                          createdAt: "2026-03-02T14:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorized — bearer token missing or expired",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      unauthorized: {
                        summary: "Token expired",
                        value: { code: 401, error: "Unauthorized", message: "Your session has expired. Please re-authenticate." }
                      }
                    }
                  }
                }
              },
              "403": {
                description: "Forbidden — caller is not authorized to view this payment",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      forbidden: {
                        summary: "Access denied",
                        value: { code: 403, error: "Forbidden", message: "You do not have permission to access payment 'pay_abc123'." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — no payment found for the given ID",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Payment not found",
                        value: { code: 404, error: "Not Found", message: "Payment 'pay_xyz999' does not exist." }
                      }
                    }
                  }
                }
              },
              "500": {
                description: "Internal Server Error — unexpected server-side failure",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      serverError: {
                        summary: "Unexpected error",
                        value: { code: 500, error: "Internal Server Error", message: "An unexpected error occurred. Please contact support." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/payments/{paymentId}/refund": {
          post: {
            tags: ["Customer Payments"],
            summary: "Request a refund for a payment",
            parameters: [
              { name: "paymentId", in: "path", required: true, schema: { type: "string" }, example: "pay_abc123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RefundRequest" },
                  examples: {
                    fullRefund: {
                      summary: "POST /payments/pay_abc123/refund — full refund",
                      value: { reason: "Guest cancelled within free cancellation window", amount: 350.00 }
                    },
                    partialRefund: {
                      summary: "POST /payments/pay_abc123/refund — partial refund",
                      value: { reason: "Partial refund due to late cancellation policy", amount: 175.00 }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Refund processed successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/RefundResponse" },
                    examples: {
                      fullRefund: {
                        summary: "Full refund issued",
                        value: {
                          refundId: "ref_xyz001",
                          paymentId: "pay_abc123",
                          amount: 350.00,
                          currency: "USD",
                          status: "refunded",
                          reason: "Guest cancelled within free cancellation window",
                          processedAt: "2026-03-05T08:00:00Z"
                        }
                      },
                      partialRefund: {
                        summary: "Partial refund issued",
                        value: {
                          refundId: "ref_xyz002",
                          paymentId: "pay_abc123",
                          amount: 175.00,
                          currency: "USD",
                          status: "refunded",
                          reason: "Partial refund due to late cancellation policy",
                          processedAt: "2026-03-05T09:30:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad Request — invalid refund amount or missing reason",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      amountExceeds: {
                        summary: "Refund amount exceeds original payment",
                        value: { code: 400, error: "Bad Request", message: "Refund amount $400.00 exceeds the original payment amount of $350.00." }
                      },
                      missingReason: {
                        summary: "Reason not provided",
                        value: { code: 400, error: "Bad Request", message: "Field 'reason' is required to process a refund." }
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorized — authentication required",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      unauthorized: {
                        summary: "Missing token",
                        value: { code: 401, error: "Unauthorized", message: "Authentication token is missing or has expired." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — payment ID does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Payment not found",
                        value: { code: 404, error: "Not Found", message: "Payment 'pay_abc123' was not found. Refund cannot be issued." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Conflict — payment has already been fully refunded",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyRefunded: {
                        summary: "Already refunded",
                        value: { code: 409, error: "Conflict", message: "Payment 'pay_abc123' has already been fully refunded." }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Unprocessable Entity — refund window has expired",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      windowExpired: {
                        summary: "Refund window expired",
                        value: { code: 422, error: "Unprocessable Entity", message: "The refund eligibility window for this payment has expired." }
                      }
                    }
                  }
                }
              },
              "500": {
                description: "Internal Server Error — refund processing failure",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      processingError: {
                        summary: "Refund processor error",
                        value: { code: 500, error: "Internal Server Error", message: "Refund could not be processed due to a payment provider error. Please try again." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // HOST PAYOUTS
        // ─────────────────────────────────────────

        "/hosts/{hostId}/payouts": {
          get: {
            tags: ["Host Payouts"],
            summary: "List all payouts for a host",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "status", in: "query", required: false, schema: { type: "string", enum: ["pending", "processing", "paid", "failed"] }, example: "paid" },
              { name: "start", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-01" },
              { name: "end", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-31" }
            ],
            responses: {
              "200": {
                description: "List of host payouts retrieved successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/PayoutListResponse" },
                    examples: {
                      marchPayouts: {
                        summary: "GET /hosts/host123/payouts?start=2026-03-01&end=2026-03-31",
                        value: {
                          hostId: "host123",
                          payouts: [
                            { payoutId: "pout_001", amount: 315.00, currency: "USD", status: "paid", method: "bank_transfer", scheduledDate: "2026-03-05", paidAt: "2026-03-05T09:00:00Z" },
                            { payoutId: "pout_002", amount: 369.00, currency: "USD", status: "paid", method: "bank_transfer", scheduledDate: "2026-03-12", paidAt: "2026-03-12T09:00:00Z" }
                          ],
                          totalPaid: 684.00
                        }
                      },
                      noPayouts: {
                        summary: "No payouts found for the given period",
                        value: {
                          hostId: "host123",
                          payouts: [],
                          totalPaid: 0.00
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad Request — invalid date range or filter values",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidDateRange: {
                        summary: "End date before start date",
                        value: { code: 400, error: "Bad Request", message: "'end' date must be after 'start' date." }
                      },
                      invalidStatus: {
                        summary: "Invalid status filter",
                        value: { code: 400, error: "Bad Request", message: "Status 'archived' is not valid. Accepted values: pending, processing, paid, failed." }
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorized — bearer token missing or expired",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      unauthorized: {
                        summary: "Token expired",
                        value: { code: 401, error: "Unauthorized", message: "Your session has expired. Please re-authenticate." }
                      }
                    }
                  }
                }
              },
              "403": {
                description: "Forbidden — caller cannot access this host's payouts",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      forbidden: {
                        summary: "Access denied",
                        value: { code: 403, error: "Forbidden", message: "You are not authorized to view payouts for host 'host123'." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — host does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Host not found",
                        value: { code: 404, error: "Not Found", message: "Host 'host999' does not exist." }
                      }
                    }
                  }
                }
              },
              "500": {
                description: "Internal Server Error — failed to retrieve payouts",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      serverError: {
                        summary: "Database error",
                        value: { code: 500, error: "Internal Server Error", message: "Failed to retrieve payouts. Please try again later." }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            tags: ["Host Payouts"],
            summary: "Request an early payout",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PayoutRequest" },
                  examples: {
                    earlyPayout: {
                      summary: "POST /hosts/host123/payouts — request early payout",
                      value: { hostId: "host123", amount: 270.00, currency: "USD", method: "bank_transfer", bankAccountId: "bank_acc_456" }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Payout request created successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/PayoutResponse" },
                    examples: {
                      created: {
                        summary: "Payout request accepted",
                        value: {
                          payoutId: "pout_004",
                          hostId: "host123",
                          amount: 270.00,
                          currency: "USD",
                          status: "processing",
                          method: "bank_transfer",
                          scheduledDate: "2026-03-20",
                          paidAt: null
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad Request — invalid payout amount or missing bank account",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      insufficientBalance: {
                        summary: "Amount exceeds available balance",
                        value: { code: 400, error: "Bad Request", message: "Requested payout amount $270.00 exceeds available balance of $200.00." }
                      },
                      missingBankAccount: {
                        summary: "Bank account not specified",
                        value: { code: 400, error: "Bad Request", message: "'bankAccountId' is required when method is 'bank_transfer'." }
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorized — authentication required",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      unauthorized: {
                        summary: "Missing or invalid token",
                        value: { code: 401, error: "Unauthorized", message: "Authentication token is missing or has expired." }
                      }
                    }
                  }
                }
              },
              "403": {
                description: "Forbidden — host account is suspended or ineligible",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      suspended: {
                        summary: "Host account suspended",
                        value: { code: 403, error: "Forbidden", message: "Payout requests are disabled for host 'host123' due to account suspension." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — host or bank account does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      bankNotFound: {
                        summary: "Bank account not found",
                        value: { code: 404, error: "Not Found", message: "Bank account 'bank_acc_999' is not linked to host 'host123'." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Conflict — a payout request is already in progress",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      inProgress: {
                        summary: "Payout already processing",
                        value: { code: 409, error: "Conflict", message: "A payout request is already being processed for host 'host123'. Please wait until it completes." }
                      }
                    }
                  }
                }
              },
              "500": {
                description: "Internal Server Error — payout initiation failed",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      processingError: {
                        summary: "Payout service error",
                        value: { code: 500, error: "Internal Server Error", message: "Payout could not be initiated due to a service error. Please try again later." }
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

          PaymentRequest: {
            type: "object",
            properties: {
              bookingId: { type: "string", example: "booking101" },
              customerId: { type: "string", example: "cust001" },
              amount: { type: "number", format: "float", example: 350.00 },
              currency: { type: "string", example: "USD" },
              method: { type: "string", enum: ["credit_card", "debit_card", "paypal", "apple_pay", "google_pay"], example: "credit_card" },
              cardToken: { type: "string", example: "tok_visa_4242" },
              paypalEmail: { type: "string", example: "guest@example.com" }
            }
          },

          PaymentResponse: {
            type: "object",
            properties: {
              paymentId: { type: "string", example: "pay_abc123" },
              bookingId: { type: "string", example: "booking101" },
              customerId: { type: "string", example: "cust001" },
              amount: { type: "number", format: "float", example: 350.00 },
              currency: { type: "string", example: "USD" },
              status: { type: "string", enum: ["pending", "completed", "failed", "refunded"], example: "completed" },
              method: { type: "string", example: "credit_card" },
              createdAt: { type: "string", format: "date-time", example: "2026-03-01T10:30:00Z" }
            }
          },

          RefundRequest: {
            type: "object",
            properties: {
              reason: { type: "string", example: "Guest cancelled within free cancellation window" },
              amount: { type: "number", format: "float", example: 350.00 }
            }
          },

          RefundResponse: {
            type: "object",
            properties: {
              refundId: { type: "string", example: "ref_xyz001" },
              paymentId: { type: "string", example: "pay_abc123" },
              amount: { type: "number", format: "float", example: 350.00 },
              currency: { type: "string", example: "USD" },
              status: { type: "string", enum: ["pending", "refunded", "failed"], example: "refunded" },
              reason: { type: "string", example: "Guest cancelled within free cancellation window" },
              processedAt: { type: "string", format: "date-time", example: "2026-03-05T08:00:00Z" }
            }
          },

          PayoutRequest: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              amount: { type: "number", format: "float", example: 270.00 },
              currency: { type: "string", example: "USD" },
              method: { type: "string", enum: ["bank_transfer", "paypal", "stripe"], example: "bank_transfer" },
              bankAccountId: { type: "string", example: "bank_acc_456" }
            }
          },

          PayoutResponse: {
            type: "object",
            properties: {
              payoutId: { type: "string", example: "pout_001" },
              hostId: { type: "string", example: "host123" },
              amount: { type: "number", format: "float", example: 315.00 },
              currency: { type: "string", example: "USD" },
              status: { type: "string", enum: ["pending", "processing", "paid", "failed"], example: "paid" },
              method: { type: "string", example: "bank_transfer" },
              scheduledDate: { type: "string", format: "date", example: "2026-03-05" },
              paidAt: { type: "string", format: "date-time", example: "2026-03-05T09:00:00Z", nullable: true }
            }
          },

          PayoutListResponse: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              payouts: { type: "array", items: { $ref: "#/components/schemas/PayoutResponse" } },
              totalPaid: { type: "number", format: "float", example: 684.00 }
            }
          },

          ErrorResponse: {
            type: "object",
            properties: {
              code: { type: "integer", example: 400 },
              error: { type: "string", example: "Bad Request" },
              message: { type: "string", example: "A human-readable description of what went wrong." }
            }
          },

          Transaction: {
            type: "object",
            properties: {
              transactionId: { type: "string", example: "txn_001" },
              type: { type: "string", enum: ["earning", "payout", "refund", "fee"], example: "earning" },
              amount: { type: "number", format: "float", example: 350.00 },
              currency: { type: "string", example: "USD" },
              bookingId: { type: "string", example: "booking101", nullable: true },
              description: { type: "string", example: "Booking payment received" },
              date: { type: "string", format: "date", example: "2026-03-01" }
            }
          },

          TransactionListResponse: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              transactions: { type: "array", items: { $ref: "#/components/schemas/Transaction" } },
              totalCount: { type: "integer", example: 4 }
            }
          },

          TaxSummary: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              year: { type: "integer", example: 2026 },
              grossIncome: { type: "number", format: "float", example: 4800.00 },
              totalFees: { type: "number", format: "float", example: 480.00 },
              netIncome: { type: "number", format: "float", example: 4320.00 },
              currency: { type: "string", example: "USD" },
              taxableIncome: { type: "number", format: "float", example: 4320.00 },
              form1099Issued: { type: "boolean", example: true }
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
