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
        // SEND NOTIFICATIONS
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
                    bookingConfirmationPush: {
                      summary: "POST /notifications/send — booking confirmation push alert",
                      value: {
                        userId: "cust001",
                        channel: "push",
                        type: "booking_confirmed",
                        recipient: { name: "Alice Johnson", deviceToken: "fcm_token_abc123" },
                        data: {
                          bookingId: "booking_101",
                          listingName: "Cozy Manhattan Loft",
                          checkIn: "2026-04-10",
                          checkOut: "2026-04-14"
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

        "/notifications/send/bulk": {
          post: {
            tags: ["Send Notifications"],
            summary: "Send notifications to multiple users at once",
            description: "Bulk dispatch of the same notification type to a list of users. Useful for platform-wide announcements, policy updates, or reminders.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BulkSendNotificationRequest" },
                  examples: {
                    checkInReminders: {
                      summary: "POST /notifications/send/bulk — check-in reminders for tomorrow's guests",
                      value: {
                        channel: "both",
                        type: "checkin_reminder",
                        notifications: [
                          {
                            userId: "cust001",
                            recipient: { name: "Alice Johnson", email: "alice@example.com", deviceToken: "fcm_token_abc123" },
                            data: { bookingId: "booking_101", listingName: "Cozy Manhattan Loft", checkIn: "2026-04-10", checkInTime: "15:00" }
                          },
                          {
                            userId: "cust002",
                            recipient: { name: "Bob Smith", email: "bob@example.com", deviceToken: "fcm_token_bob456" },
                            data: { bookingId: "booking_102", listingName: "Sunny LA Studio", checkIn: "2026-04-10", checkInTime: "14:00" }
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Bulk notifications dispatched",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BulkDispatchResponse" },
                    examples: {
                      bulkResult: {
                        summary: "Bulk send result",
                        value: {
                          total: 2,
                          queued: 2,
                          failed: 0,
                          notifications: [
                            { notificationId: "notif_e010", userId: "cust001", status: "queued" },
                            { notificationId: "notif_e011", userId: "cust002", status: "queued" }
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
        // NOTIFICATION TYPES (TEMPLATES)
        // ─────────────────────────────────────────

        "/notifications/types": {
          get: {
            tags: ["Notification Types"],
            summary: "List all supported notification types",
            description: "Returns all notification event types supported by the platform, along with which channels they support.",
            responses: {
              "200": {
                description: "Notification types",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/NotificationTypeListResponse" },
                    examples: {
                      allTypes: {
                        summary: "GET /notifications/types",
                        value: {
                          types: [
                            { type: "booking_confirmed", description: "Sent to guest and host when a booking is confirmed", channels: ["email", "push"] },
                            { type: "new_booking_request", description: "Sent to host when a guest requests a booking", channels: ["email", "push"] },
                            { type: "booking_declined", description: "Sent to guest when host declines their request", channels: ["email", "push"] },
                            { type: "booking_cancelled_by_guest", description: "Sent to host when a guest cancels", channels: ["email", "push"] },
                            { type: "booking_cancelled_by_host", description: "Sent to guest when a host cancels", channels: ["email", "push"] },
                            { type: "checkin_reminder", description: "Sent to guest 24h before check-in", channels: ["email", "push"] },
                            { type: "checkout_reminder", description: "Sent to guest morning of checkout", channels: ["push"] },
                            { type: "payment_received", description: "Sent to guest after successful payment", channels: ["email", "push"] },
                            { type: "payout_sent", description: "Sent to host when a payout is processed", channels: ["email", "push"] },
                            { type: "refund_processed", description: "Sent to guest when a refund is issued", channels: ["email", "push"] },
                            { type: "booking_modified", description: "Sent when either party accepts a booking modification", channels: ["email", "push"] },
                            { type: "review_request", description: "Sent to guest and host 24h after checkout to prompt reviews", channels: ["email", "push"] }
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
        // USER NOTIFICATION HISTORY
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

        "/users/{userId}/notifications/{notificationId}/read": {
          patch: {
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
                        summary: "PATCH /users/cust001/notifications/notif_e001/read",
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

        "/users/{userId}/notifications/read-all": {
          patch: {
            tags: ["Notification History"],
            summary: "Mark all notifications as read for a user",
            description: "Marks every unread notification in the user's inbox as read in one call. Used when the user opens the notification panel.",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" }
            ],
            responses: {
              "200": {
                description: "All notifications marked as read",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BulkReadResponse" },
                    examples: {
                      allRead: {
                        summary: "PATCH /users/cust001/notifications/read-all",
                        value: {
                          userId: "cust001",
                          markedRead: 5,
                          updatedAt: "2026-03-05T10:00:00Z"
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
        // NOTIFICATION DELIVERY STATUS
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

        "/notifications/{notificationId}/resend": {
          post: {
            tags: ["Delivery Status"],
            summary: "Resend a failed or undelivered notification",
            description: "Retries delivery of a notification that failed or was never delivered. Only valid for notifications in 'failed' or 'queued' status.",
            parameters: [
              { name: "notificationId", in: "path", required: true, schema: { type: "string" }, example: "notif_e003" }
            ],
            responses: {
              "200": {
                description: "Notification re-queued for delivery",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/NotificationDispatchResponse" },
                    examples: {
                      requeued: {
                        summary: "POST /notifications/notif_e003/resend",
                        value: {
                          notificationId: "notif_e003",
                          userId: "cust001",
                          channel: "push",
                          type: "checkin_reminder",
                          status: "queued",
                          createdAt: "2026-04-09T09:30:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Cannot resend — notification already delivered",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyDelivered: {
                        summary: "Resend rejected for delivered notification",
                        value: {
                          code: "ALREADY_DELIVERED",
                          message: "Notification notif_e001 was already delivered at 2026-03-01T12:05:18Z and cannot be resent."
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
        // USER NOTIFICATION PREFERENCES
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
          patch: {
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
                      summary: "PATCH /users/cust001/notification-preferences — disable checkout push",
                      value: {
                        preferences: [
                          { type: "checkout_reminder", email: false, push: false }
                        ]
                      }
                    },
                    muteMarketingOnly: {
                      summary: "PATCH /users/cust001/notification-preferences — turn off review request emails",
                      value: {
                        preferences: [
                          { type: "review_request", email: false, push: false }
                        ]
                      }
                    },
                    enableAll: {
                      summary: "PATCH /users/cust001/notification-preferences — enable all channels",
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
        // DEVICE TOKENS (PUSH REGISTRATION)
        // ─────────────────────────────────────────

        "/users/{userId}/device-tokens": {
          get: {
            tags: ["Device Tokens"],
            summary: "List registered device tokens for push notifications",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" }
            ],
            responses: {
              "200": {
                description: "Registered devices",
                content: {
                  "application/json": {
                    schema: { type: "array", items: { $ref: "#/components/schemas/DeviceToken" } },
                    examples: {
                      devices: {
                        summary: "GET /users/cust001/device-tokens",
                        value: [
                          { tokenId: "dtoken_001", deviceToken: "fcm_token_abc123", platform: "android", deviceName: "Pixel 7", registeredAt: "2026-01-15T10:00:00Z", isActive: true },
                          { tokenId: "dtoken_002", deviceToken: "apns_token_xyz789", platform: "ios", deviceName: "iPhone 15", registeredAt: "2026-02-01T09:00:00Z", isActive: true }
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
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
        },

        "/users/{userId}/device-tokens/{tokenId}": {
          delete: {
            tags: ["Device Tokens"],
            summary: "Remove a device token",
            description: "Deregisters a device from push notifications. Called on logout or when a token becomes invalid.",
            parameters: [
              { name: "userId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              { name: "tokenId", in: "path", required: true, schema: { type: "string" }, example: "dtoken_001" }
            ],
            responses: { "204": { description: "Device token removed successfully" } }
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

          BulkSendNotificationRequest: {
            type: "object",
            properties: {
              channel: { type: "string", enum: ["email", "push", "both"], example: "both" },
              type: { type: "string", example: "checkin_reminder" },
              notifications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    userId: { type: "string", example: "cust001" },
                    recipient: {
                      type: "object",
                      properties: {
                        name: { type: "string", example: "Alice Johnson" },
                        email: { type: "string", example: "alice@example.com" },
                        deviceToken: { type: "string", example: "fcm_token_abc123" }
                      }
                    },
                    data: { type: "object", example: { bookingId: "booking_101", listingName: "Cozy Manhattan Loft", checkIn: "2026-04-10" } }
                  }
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

          BulkDispatchResponse: {
            type: "object",
            properties: {
              total: { type: "integer", example: 2 },
              queued: { type: "integer", example: 2 },
              failed: { type: "integer", example: 0 },
              notifications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    notificationId: { type: "string", example: "notif_e010" },
                    userId: { type: "string", example: "cust001" },
                    status: { type: "string", example: "queued" }
                  }
                }
              }
            }
          },

          NotificationTypeListResponse: {
            type: "object",
            properties: {
              types: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", example: "booking_confirmed" },
                    description: { type: "string", example: "Sent to guest and host when a booking is confirmed" },
                    channels: { type: "array", items: { type: "string" }, example: ["email", "push"] }
                  }
                }
              }
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

          BulkReadResponse: {
            type: "object",
            properties: {
              userId: { type: "string", example: "cust001" },
              markedRead: { type: "integer", example: 5 },
              updatedAt: { type: "string", format: "date-time", example: "2026-03-05T10:00:00Z" }
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
