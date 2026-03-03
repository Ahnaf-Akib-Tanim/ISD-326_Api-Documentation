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
                description: "Payment details",
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
                description: "Refund processed",
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
                description: "List of host payouts",
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
                description: "Payout request created",
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
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // EARNINGS & FINANCIAL REPORTS
        // ─────────────────────────────────────────

        "/hosts/{hostId}/earnings": {
          get: {
            tags: ["Financial Management"],
            summary: "Get earnings summary for a host",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "year", in: "query", required: false, schema: { type: "integer" }, example: 2026 },
              { name: "month", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 12 }, example: 3 }
            ],
            responses: {
              "200": {
                description: "Earnings summary",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/EarningsSummary" },
                    examples: {
                      monthlyEarnings: {
                        summary: "GET /hosts/host123/earnings?year=2026&month=3",
                        value: {
                          hostId: "host123",
                          period: { year: 2026, month: 3 },
                          grossEarnings: 760.00,
                          platformFee: 76.00,
                          netEarnings: 684.00,
                          currency: "USD",
                          bookingsCount: 3,
                          averagePerBooking: 228.00
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
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

          EarningsSummary: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              period: {
                type: "object",
                properties: {
                  year: { type: "integer", example: 2026 },
                  month: { type: "integer", example: 3 }
                }
              },
              grossEarnings: { type: "number", format: "float", example: 760.00 },
              platformFee: { type: "number", format: "float", example: 76.00 },
              netEarnings: { type: "number", format: "float", example: 684.00 },
              currency: { type: "string", example: "USD" },
              bookingsCount: { type: "integer", example: 3 },
              averagePerBooking: { type: "number", format: "float", example: 228.00 }
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
