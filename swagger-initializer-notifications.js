window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: {
      openapi: "3.0.3",
      info: {
        title: "Confirmation Notifications API",
        version: "1.0.0",
        description: "APIs to send, manage, and track email and in-app push notifications for booking confirmations, cancellations, check-in reminders, payment receipts, and other platform events on Airbnb."
      },
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "http://localhost:3000", description: "Local dev" }
      ],
      security: [{ bearerAuth: [] }],
      paths: {

        // ─────────────────────────────────────────
        // 1. SEND NOTIFICATION
        // ─────────────────────────────────────────

        "/notifications/send": {
          post: {
            tags: ["Send Notifications"],
            summary: "Send a notification to a user",
            description: "Triggers an email, push notification, or both to a specific user. Used internally by booking, payment, and cancellation flows.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SendNotificationRequest" },
                  examples: {
                    bookingConfirmationEmail: {
                      summary: "POST /notifications/send — booking confirmation email to guest",
                      value: {
                        userId: "cust001",
                        channel: "email",
                        type: "booking_confirmed",
                        recipient: { name: "Alice Johnson", email: "alice@example.com" },
                        data: {
                          bookingId: "booking_101",
                          listingName: "Cozy Manhattan Loft",
                          hostName: "John Host",
                          checkIn: "2026-04-10",
                          checkOut: "2026-04-14",
                          totalPrice: 520.00,
                          currency: "USD"
                        }
                      }
                    },
                    bothChannels: {
                      summary: "POST /notifications/send — send via both email and push",
                      value: {
                        userId: "cust001",
                        channel: "both",
                        type: "booking_confirmed",
                        recipient: {
                          name: "Alice Johnson",
                          email: "alice@example.com",
                          deviceToken: "fcm_token_abc123"
                        },
                        data: {
                          bookingId: "booking_101",
                          listingName: "Cozy Manhattan Loft",
                          hostName: "John Host",
                          checkIn: "2026-04-10",
                          checkOut: "2026-04-14",
                          totalPrice: 520.00,
                          currency: "USD"
                        }
                      }
                    },
                    hostNewBookingAlert: {
                      summary: "POST /notifications/send — alert host about new booking request",
                      value: {
                        userId: "host123",
                        channel: "both",
                        type: "new_booking_request",
                        recipient: {
                          name: "John Host",
                          email: "host@example.com",
                          deviceToken: "fcm_token_host_xyz"
                        },
                        data: {
                          bookingId: "booking_101",
                          guestName: "Alice Johnson",
                          listingName: "Cozy Manhattan Loft",
                          checkIn: "2026-04-10",
                          checkOut: "2026-04-14",
                          totalPrice: 520.00,
                          currency: "USD"
                        }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Notification dispatched successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/NotificationDispatchResponse" },
                    examples: {
                      emailSent: {
                        summary: "Email notification queued",
                        value: {
                          notificationId: "notif_e001",
                          userId: "cust001",
                          channel: "email",
                          type: "booking_confirmed",
                          status: "queued",
                          createdAt: "2026-03-01T12:05:00Z"
                        }
                      },
                      bothSent: {
                        summary: "Email + push both queued",
                        value: {
                          notificationId: "notif_e002",
                          userId: "cust001",
                          channel: "both",
                          type: "booking_confirmed",
                          status: "queued",
                          createdAt: "2026-03-01T12:06:00Z"
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
        // 2. NOTIFICATION HISTORY (INBOX)
        // ─────────────────────────────────────────

        "/users/{userId}/notifications": {
          get: {
            tags: ["Notification History"],
            summary: "Get notification history for a user",
            description: "Returns all notifications sent to a user — both email and push. Used to render the in-app notification inbox.",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              {
                name: "channel", in: "query", required: false,
                schema: { type: "string", enum: ["email", "push", "both"] },
                example: "push"
              },
              {
                name: "type", in: "query", required: false,
                schema: { type: "string" },
                example: "booking_confirmed"
              },
              {
                name: "status", in: "query", required: false,
                schema: { type: "string", enum: ["queued", "sent", "delivered", "failed", "read"] },
                example: "delivered"
              },
              { name: "start", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-01" },
              { name: "end", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-31" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 20 }, example: 20 }
            ],
            responses: {
              "200": {
                description: "Notification history",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/NotificationHistoryResponse" },
                    examples: {
                      guestInbox: {
                        summary: "GET /users/cust001/notifications — guest inbox",
                        value: {
                          userId: "cust001",
                          notifications: [
                            {
                              notificationId: "notif_e001",
                              channel: "email",
                              type: "booking_confirmed",
                              subject: "Your booking at Cozy Manhattan Loft is confirmed!",
                              status: "delivered",
                              readAt: null,
                              createdAt: "2026-03-01T12:05:00Z",
                              deliveredAt: "2026-03-01T12:05:18Z"
                            },
                            {
                              notificationId: "notif_p001",
                              channel: "push",
                              type: "checkin_reminder",
                              subject: "Your check-in at Cozy Manhattan Loft is tomorrow!",
                              status: "delivered",
                              readAt: "2026-04-09T08:30:00Z",
                              createdAt: "2026-04-09T08:00:00Z",
                              deliveredAt: "2026-04-09T08:00:04Z"
                            },
                            {
                              notificationId: "notif_e002",
                              channel: "email",
                              type: "payment_received",
                              subject: "Payment confirmed — $520.00 for Cozy Manhattan Loft",
                              status: "delivered",
                              readAt: "2026-03-01T13:10:00Z",
                              createdAt: "2026-03-01T12:06:00Z",
                              deliveredAt: "2026-03-01T12:06:22Z"
                            }
                          ],
                          totalCount: 3,
                          unreadCount: 1,
                          page: 1,
                          limit: 20
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
        // 3. SINGLE NOTIFICATION DETAIL
        // ─────────────────────────────────────────

        "/users/{userId}/notifications/{notificationId}": {
          get: {
            tags: ["Notification History"],
            summary: "Get a single notification by ID",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              { name: "notificationId", in: "path", required: true, schema: { type: "string" }, example: "notif_e001" }
            ],
            responses: {
              "200": {
                description: "Notification detail",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/NotificationDetail" },
                    examples: {
                      emailDetail: {
                        summary: "GET /users/cust001/notifications/notif_e001",
                        value: {
                          notificationId: "notif_e001",
                          userId: "cust001",
                          channel: "email",
                          type: "booking_confirmed",
                          subject: "Your booking at Cozy Manhattan Loft is confirmed!",
                          body: "Hi Alice, great news! Your booking at Cozy Manhattan Loft from April 10 to April 14 has been confirmed by your host John Host. Your total is $520.00 USD.",
                          status: "delivered",
                          readAt: null,
                          createdAt: "2026-03-01T12:05:00Z",
                          deliveredAt: "2026-03-01T12:05:18Z",
                          recipient: { name: "Alice Johnson", email: "alice@example.com" }
                        }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Notification not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Notification ID does not exist",
                        value: { code: "NOTIFICATION_NOT_FOUND", message: "No notification found with ID notif_e999 for user cust001" }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // 4. MARK NOTIFICATION AS READ
        // ─────────────────────────────────────────

        "/users/{userId}/notifications/{notificationId}/read": {
          put: {
            tags: ["Notification History"],
            summary: "Mark a notification as read",
            description: "Marks a specific notification as read. Updates the unread count in the user's notification inbox.",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              { name: "notificationId", in: "path", required: true, schema: { type: "string" }, example: "notif_e001" }
            ],
            responses: {
              "200": {
                description: "Notification marked as read",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/NotificationReadResponse" },
                    examples: {
                      markedRead: {
                        summary: "PUT /users/cust001/notifications/notif_e001/read",
                        value: {
                          notificationId: "notif_e001",
                          userId: "cust001",
                          status: "read",
                          readAt: "2026-03-02T09:15:00Z"
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
        // 5. NOTIFICATION DELIVERY STATUS
        // ─────────────────────────────────────────

        "/notifications/{notificationId}/status": {
          get: {
            tags: ["Delivery Status"],
            summary: "Get delivery status of a notification",
            description: "Returns real-time delivery status of a dispatched notification — queued, sent, delivered, or failed. Useful for debugging undelivered alerts.",
            parameters: [
              { name: "notificationId", in: "path", required: true, schema: { type: "string" }, example: "notif_e001" }
            ],
            responses: {
              "200": {
                description: "Delivery status",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/DeliveryStatusResponse" },
                    examples: {
                      delivered: {
                        summary: "GET /notifications/notif_e001/status — delivered",
                        value: {
                          notificationId: "notif_e001",
                          channel: "email",
                          type: "booking_confirmed",
                          status: "delivered",
                          queuedAt: "2026-03-01T12:05:00Z",
                          sentAt: "2026-03-01T12:05:10Z",
                          deliveredAt: "2026-03-01T12:05:18Z",
                          failureReason: null
                        }
                      },
                      failed: {
                        summary: "GET /notifications/notif_e003/status — failed",
                        value: {
                          notificationId: "notif_e003",
                          channel: "push",
                          type: "checkin_reminder",
                          status: "failed",
                          queuedAt: "2026-04-09T08:00:00Z",
                          sentAt: "2026-04-09T08:00:05Z",
                          deliveredAt: null,
                          failureReason: "Device token expired or invalid"
                        }
                      },
                      queued: {
                        summary: "GET /notifications/notif_e004/status — still queued",
                        value: {
                          notificationId: "notif_e004",
                          channel: "email",
                          type: "payout_sent",
                          status: "queued",
                          queuedAt: "2026-04-14T09:00:00Z",
                          sentAt: null,
                          deliveredAt: null,
                          failureReason: null
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
        // 6 & 7. NOTIFICATION PREFERENCES
        // ─────────────────────────────────────────

        "/users/{userId}/notification-preferences": {
          get: {
            tags: ["Notification Preferences"],
            summary: "Get notification preferences for a user",
            description: "Returns the user's opt-in/opt-out settings per notification type and channel.",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" }
            ],
            responses: {
              "200": {
                description: "User notification preferences",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/NotificationPreferences" },
                    examples: {
                      prefs: {
                        summary: "GET /users/cust001/notification-preferences",
                        value: {
                          userId: "cust001",
                          preferences: [
                            { type: "booking_confirmed", email: true, push: true },
                            { type: "new_booking_request", email: true, push: true },
                            { type: "booking_cancelled_by_host", email: true, push: true },
                            { type: "checkin_reminder", email: false, push: true },
                            { type: "checkout_reminder", email: false, push: true },
                            { type: "payment_received", email: true, push: false },
                            { type: "payout_sent", email: true, push: true },
                            { type: "refund_processed", email: true, push: true },
                            { type: "review_request", email: true, push: false }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          put: {
            tags: ["Notification Preferences"],
            summary: "Update notification preferences for a user",
            description: "Allows a user to opt in or out of specific notification types per channel.",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/NotificationPreferencesUpdate" },
                  examples: {
                    disableCheckoutPush: {
                      summary: "PUT /users/cust001/notification-preferences — disable checkout push",
                      value: {
                        preferences: [
                          { type: "checkout_reminder", email: false, push: false }
                        ]
                      }
                    },
                    muteReviewRequest: {
                      summary: "PUT /users/cust001/notification-preferences — turn off review request emails",
                      value: {
                        preferences: [
                          { type: "review_request", email: false, push: false }
                        ]
                      }
                    },
                    enableAll: {
                      summary: "PUT /users/cust001/notification-preferences — enable all channels",
                      value: {
                        preferences: [
                          { type: "booking_confirmed", email: true, push: true },
                          { type: "checkin_reminder", email: true, push: true },
                          { type: "payment_received", email: true, push: true },
                          { type: "review_request", email: true, push: true }
                        ]
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Preferences updated",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/NotificationPreferences" },
                    examples: {
                      updated: {
                        summary: "Updated preferences saved",
                        value: {
                          userId: "cust001",
                          preferences: [
                            { type: "booking_confirmed", email: true, push: true },
                            { type: "checkin_reminder", email: false, push: true },
                            { type: "checkout_reminder", email: false, push: false },
                            { type: "payment_received", email: true, push: false },
                            { type: "review_request", email: false, push: false }
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
        // 8. REGISTER DEVICE TOKEN (PUSH)
        // ─────────────────────────────────────────

        "/users/{userId}/device-tokens": {
          post: {
            tags: ["Device Tokens"],
            summary: "Register a device token for push notifications",
            description: "Called when a user logs in on a new device or when the OS issues a new push token. Required before push notifications can be delivered.",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DeviceTokenRegisterRequest" },
                  examples: {
                    androidToken: {
                      summary: "POST /users/cust001/device-tokens — register Android (FCM)",
                      value: { deviceToken: "fcm_token_abc123", platform: "android", deviceName: "Pixel 7" }
                    },
                    iosToken: {
                      summary: "POST /users/cust001/device-tokens — register iOS (APNs)",
                      value: { deviceToken: "apns_token_xyz789", platform: "ios", deviceName: "iPhone 15" }
                    },
                    webToken: {
                      summary: "POST /users/cust001/device-tokens — register web browser",
                      value: { deviceToken: "web_push_token_def456", platform: "web", deviceName: "Chrome on MacBook" }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Device token registered",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/DeviceToken" },
                    examples: {
                      registered: {
                        summary: "Token registered successfully",
                        value: {
                          tokenId: "dtoken_003",
                          deviceToken: "web_push_token_def456",
                          platform: "web",
                          deviceName: "Chrome on MacBook",
                          registeredAt: "2026-03-01T08:00:00Z",
                          isActive: true
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

          SendNotificationRequest: {
            type: "object",
            properties: {
              userId: { type: "string", example: "cust001" },
              channel: { type: "string", enum: ["email", "push", "both"], example: "both" },
              type: { type: "string", example: "booking_confirmed" },
              recipient: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Alice Johnson" },
                  email: { type: "string", example: "alice@example.com" },
                  deviceToken: { type: "string", example: "fcm_token_abc123" }
                }
              },
              data: {
                type: "object",
                description: "Dynamic data merged into the notification template",
                example: {
                  bookingId: "booking_101",
                  listingName: "Cozy Manhattan Loft",
                  checkIn: "2026-04-10",
                  checkOut: "2026-04-14",
                  totalPrice: 520.00,
                  currency: "USD"
                }
              }
            }
          },

          NotificationDispatchResponse: {
            type: "object",
            properties: {
              notificationId: { type: "string", example: "notif_e001" },
              userId: { type: "string", example: "cust001" },
              channel: { type: "string", enum: ["email", "push", "both"], example: "email" },
              type: { type: "string", example: "booking_confirmed" },
              status: { type: "string", enum: ["queued", "sent", "delivered", "failed"], example: "queued" },
              createdAt: { type: "string", format: "date-time", example: "2026-03-01T12:05:00Z" }
            }
          },

          NotificationSummary: {
            type: "object",
            properties: {
              notificationId: { type: "string", example: "notif_e001" },
              channel: { type: "string", enum: ["email", "push"], example: "email" },
              type: { type: "string", example: "booking_confirmed" },
              subject: { type: "string", example: "Your booking at Cozy Manhattan Loft is confirmed!" },
              status: { type: "string", enum: ["queued", "sent", "delivered", "failed", "read"], example: "delivered" },
              readAt: { type: "string", format: "date-time", example: null, nullable: true },
              createdAt: { type: "string", format: "date-time", example: "2026-03-01T12:05:00Z" },
              deliveredAt: { type: "string", format: "date-time", example: "2026-03-01T12:05:18Z", nullable: true }
            }
          },

          NotificationHistoryResponse: {
            type: "object",
            properties: {
              userId: { type: "string", example: "cust001" },
              notifications: { type: "array", items: { $ref: "#/components/schemas/NotificationSummary" } },
              totalCount: { type: "integer", example: 3 },
              unreadCount: { type: "integer", example: 1 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 }
            }
          },

          NotificationDetail: {
            type: "object",
            properties: {
              notificationId: { type: "string", example: "notif_e001" },
              userId: { type: "string", example: "cust001" },
              channel: { type: "string", enum: ["email", "push"], example: "email" },
              type: { type: "string", example: "booking_confirmed" },
              subject: { type: "string", example: "Your booking at Cozy Manhattan Loft is confirmed!" },
              body: { type: "string", example: "Hi Alice, your booking from April 10 to April 14 has been confirmed." },
              status: { type: "string", enum: ["queued", "sent", "delivered", "failed", "read"], example: "delivered" },
              readAt: { type: "string", format: "date-time", nullable: true, example: null },
              createdAt: { type: "string", format: "date-time", example: "2026-03-01T12:05:00Z" },
              deliveredAt: { type: "string", format: "date-time", example: "2026-03-01T12:05:18Z" },
              recipient: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Alice Johnson" },
                  email: { type: "string", example: "alice@example.com" }
                }
              }
            }
          },

          NotificationReadResponse: {
            type: "object",
            properties: {
              notificationId: { type: "string", example: "notif_e001" },
              userId: { type: "string", example: "cust001" },
              status: { type: "string", example: "read" },
              readAt: { type: "string", format: "date-time", example: "2026-03-02T09:15:00Z" }
            }
          },

          DeliveryStatusResponse: {
            type: "object",
            properties: {
              notificationId: { type: "string", example: "notif_e001" },
              channel: { type: "string", enum: ["email", "push"], example: "email" },
              type: { type: "string", example: "booking_confirmed" },
              status: { type: "string", enum: ["queued", "sent", "delivered", "failed"], example: "delivered" },
              queuedAt: { type: "string", format: "date-time", example: "2026-03-01T12:05:00Z" },
              sentAt: { type: "string", format: "date-time", example: "2026-03-01T12:05:10Z", nullable: true },
              deliveredAt: { type: "string", format: "date-time", example: "2026-03-01T12:05:18Z", nullable: true },
              failureReason: { type: "string", example: null, nullable: true }
            }
          },

          NotificationPreferenceItem: {
            type: "object",
            properties: {
              type: { type: "string", example: "booking_confirmed" },
              email: { type: "boolean", example: true },
              push: { type: "boolean", example: true }
            }
          },

          NotificationPreferences: {
            type: "object",
            properties: {
              userId: { type: "string", example: "cust001" },
              preferences: { type: "array", items: { $ref: "#/components/schemas/NotificationPreferenceItem" } }
            }
          },

          NotificationPreferencesUpdate: {
            type: "object",
            properties: {
              preferences: { type: "array", items: { $ref: "#/components/schemas/NotificationPreferenceItem" } }
            }
          },

          DeviceToken: {
            type: "object",
            properties: {
              tokenId: { type: "string", example: "dtoken_001" },
              deviceToken: { type: "string", example: "fcm_token_abc123" },
              platform: { type: "string", enum: ["android", "ios", "web"], example: "android" },
              deviceName: { type: "string", example: "Pixel 7" },
              registeredAt: { type: "string", format: "date-time", example: "2026-01-15T10:00:00Z" },
              isActive: { type: "boolean", example: true }
            }
          },

          DeviceTokenRegisterRequest: {
            type: "object",
            properties: {
              deviceToken: { type: "string", example: "fcm_token_abc123" },
              platform: { type: "string", enum: ["android", "ios", "web"], example: "android" },
              deviceName: { type: "string", example: "Pixel 7" }
            }
          },

          ErrorResponse: {
            type: "object",
            properties: {
              code: { type: "string", example: "NOTIFICATION_NOT_FOUND" },
              message: { type: "string", example: "No notification found with ID notif_e999 for user cust001" }
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
