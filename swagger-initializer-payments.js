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
                        summary: "Completed payment",
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
                        summary: "Pending payment",
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
                        summary: "Payouts for March 2026",
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
                        summary: "No payouts in period",
                        value: { hostId: "host123", payouts: [], totalPaid: 0.00 }
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
                description: "Bad Request — invalid amount or missing bank account",
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
