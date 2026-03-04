window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: {
      openapi: "3.0.3",
      info: {
        title: "Review Read, Write & AI Summary API",
        version: "1.0.0",
        description: "APIs to read guest and host reviews, submit new reviews, respond to reviews, flag inappropriate content, and generate AI-powered summary insights condensed from all available reviews for a listing on the Airbnb platform."
      },
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "http://localhost:3000", description: "Local dev" }
      ],
      security: [{ bearerAuth: [] }],
      paths: {

        // ─────────────────────────────────────────
        // READ REVIEWS
        // ─────────────────────────────────────────

        "/listings/{listingId}/reviews": {
          get: {
            tags: ["Read Reviews"],
            summary: "Get all reviews for a listing",
            description: "Returns paginated guest reviews for a listing, with optional filters by rating, language, and keyword.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "minRating", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 5 }, example: 4 },
              { name: "maxRating", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 5 }, example: 5 },
              { name: "language", in: "query", required: false, schema: { type: "string" }, example: "en" },
              { name: "keyword", in: "query", required: false, schema: { type: "string" }, example: "clean" },
              { name: "sortBy", in: "query", required: false, schema: { type: "string", enum: ["newest", "oldest", "highest_rating", "lowest_rating", "most_helpful"] }, example: "newest" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Paginated list of reviews returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ReviewListResponse" },
                    examples: {
                      allReviews: {
                        summary: "200 — reviews with mixed ratings, sorted by newest",
                        value: {
                          listingId: "listing_nyc_001",
                          totalCount: 214,
                          averageRating: 4.87,
                          ratingBreakdown: { "5": 172, "4": 31, "3": 8, "2": 2, "1": 1 },
                          categoryRatings: { cleanliness: 4.9, accuracy: 4.8, checkIn: 4.95, communication: 4.9, location: 4.7, value: 4.6 },
                          page: 1,
                          limit: 10,
                          reviews: [
                            {
                              reviewId: "rev_001",
                              bookingId: "booking_090",
                              guestId: "cust001",
                              guestName: "Alice J.",
                              guestAvatar: "https://cdn.example.com/avatars/cust001.jpg",
                              rating: 5,
                              categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 4, value: 5 },
                              comment: "Absolutely fantastic stay! The loft was spotlessly clean, exactly as described, and John was incredibly responsive.",
                              language: "en",
                              helpfulCount: 14,
                              hostResponse: null,
                              createdAt: "2026-02-18T09:00:00Z"
                            },
                            {
                              reviewId: "rev_002",
                              bookingId: "booking_081",
                              guestId: "cust009",
                              guestName: "Marco R.",
                              guestAvatar: "https://cdn.example.com/avatars/cust009.jpg",
                              rating: 4,
                              categoryRatings: { cleanliness: 5, accuracy: 4, checkIn: 5, communication: 4, location: 5, value: 4 },
                              comment: "Great stay overall. Clean and well-located. Minor street noise at night.",
                              language: "en",
                              helpfulCount: 7,
                              hostResponse: {
                                comment: "Thank you for the feedback Marco! Hope to host you again!",
                                createdAt: "2026-02-10T11:30:00Z"
                              },
                              createdAt: "2026-02-08T14:00:00Z"
                            }
                          ]
                        }
                      },
                      noResults: {
                        summary: "200 — no reviews match the applied filters",
                        value: {
                          listingId: "listing_nyc_001",
                          totalCount: 0,
                          averageRating: 4.87,
                          ratingBreakdown: { "5": 172, "4": 31, "3": 8, "2": 2, "1": 1 },
                          categoryRatings: { cleanliness: 4.9, accuracy: 4.8, checkIn: 4.95, communication: 4.9, location: 4.7, value: 4.6 },
                          page: 1,
                          limit: 10,
                          reviews: []
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — invalid filter parameters",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidRating: {
                        summary: "400 — minRating exceeds maxRating",
                        value: { code: "INVALID_RATING_RANGE", message: "'minRating' cannot be greater than 'maxRating'." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Listing not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      listingNotFound: {
                        summary: "404 — listing ID does not exist",
                        value: { code: "LISTING_NOT_FOUND", message: "No listing found with ID listing_xyz_999." }
                      }
                    }
                  }
                }
              }
            }
          },

          // ─────────────────────────────────────────
          // WRITE REVIEWS
          // ─────────────────────────────────────────

          post: {
            tags: ["Write Reviews"],
            summary: "Submit a guest review for a listing",
            description: "Allows a guest to submit a review after their stay is completed. Can only be submitted once per booking and within 14 days of checkout.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReviewCreateRequest" },
                  examples: {
                    fiveStar: {
                      summary: "POST — 5-star review",
                      value: {
                        bookingId: "booking_101",
                        guestId: "cust001",
                        rating: 5,
                        categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
                        comment: "One of the best Airbnb stays I have ever had. The place was immaculate, the host John went above and beyond."
                      }
                    },
                    fourStar: {
                      summary: "POST — 4-star review with constructive feedback",
                      value: {
                        bookingId: "booking_104",
                        guestId: "cust007",
                        rating: 4,
                        categoryRatings: { cleanliness: 5, accuracy: 4, checkIn: 5, communication: 4, location: 4, value: 3 },
                        comment: "Great apartment and very clean. Price felt a little high but the location makes up for it."
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Review submitted successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Review" },
                    examples: {
                      submitted: {
                        summary: "201 — review created and published",
                        value: {
                          reviewId: "rev_215",
                          bookingId: "booking_101",
                          listingId: "listing_nyc_001",
                          guestId: "cust001",
                          guestName: "Alice J.",
                          guestAvatar: "https://cdn.example.com/avatars/cust001.jpg",
                          rating: 5,
                          categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
                          comment: "One of the best Airbnb stays I have ever had. The place was immaculate.",
                          language: "en",
                          helpfulCount: 0,
                          hostResponse: null,
                          createdAt: "2026-04-15T10:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Review already submitted for this booking",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyReviewed: {
                        summary: "409 — duplicate review attempt",
                        value: { code: "REVIEW_ALREADY_EXISTS", message: "A review for booking booking_101 has already been submitted." }
                      }
                    }
                  }
                }
              },
              "422": {
                description: "Review window expired or booking not completed",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      windowExpired: {
                        summary: "422 — 14-day review window has passed",
                        value: { code: "REVIEW_WINDOW_EXPIRED", message: "Reviews must be submitted within 14 days of checkout. Checkout was 2026-02-01." }
                      },
                      bookingNotCompleted: {
                        summary: "422 — stay not yet completed",
                        value: { code: "BOOKING_NOT_COMPLETED", message: "Reviews can only be submitted after a stay is completed. Current status: confirmed." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/listings/{listingId}/reviews/{reviewId}": {
          get: {
            tags: ["Read Reviews"],
            summary: "Get a single review by ID",
            description: "Returns full detail of one review including all category ratings, guest profile, and any host response.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "reviewId", in: "path", required: true, schema: { type: "string" }, example: "rev_001" }
            ],
            responses: {
              "200": {
                description: "Review detail returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Review" },
                    examples: {
                      reviewDetail: {
                        summary: "200 — 5-star review without host response",
                        value: {
                          reviewId: "rev_001",
                          bookingId: "booking_090",
                          listingId: "listing_nyc_001",
                          guestId: "cust001",
                          guestName: "Alice J.",
                          guestAvatar: "https://cdn.example.com/avatars/cust001.jpg",
                          rating: 5,
                          categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 4, value: 5 },
                          comment: "Absolutely fantastic stay! The loft was spotlessly clean, exactly as described, and John was incredibly responsive.",
                          language: "en",
                          helpfulCount: 14,
                          hostResponse: null,
                          createdAt: "2026-02-18T09:00:00Z"
                        }
                      },
                      reviewWithResponse: {
                        summary: "200 — 4-star review with host response",
                        value: {
                          reviewId: "rev_002",
                          bookingId: "booking_081",
                          listingId: "listing_nyc_001",
                          guestId: "cust009",
                          guestName: "Marco R.",
                          guestAvatar: "https://cdn.example.com/avatars/cust009.jpg",
                          rating: 4,
                          categoryRatings: { cleanliness: 5, accuracy: 4, checkIn: 5, communication: 4, location: 5, value: 4 },
                          comment: "Great stay overall. Clean and well-located. Minor street noise at night.",
                          language: "en",
                          helpfulCount: 7,
                          hostResponse: {
                            comment: "Thank you for the feedback Marco! We appreciate the kind words. Hope to host you again!",
                            createdAt: "2026-02-10T11:30:00Z"
                          },
                          createdAt: "2026-02-08T14:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Review not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "404 — review ID does not exist for this listing",
                        value: { code: "REVIEW_NOT_FOUND", message: "No review found with ID rev_999 for listing listing_nyc_001." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/listings/{listingId}/reviews/{reviewId}/response": {
          post: {
            tags: ["Write Reviews"],
            summary: "Submit a host response to a guest review",
            description: "Allows the host to publicly respond to a guest review. Only the listing's host can respond, and only once per review.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "reviewId", in: "path", required: true, schema: { type: "string" }, example: "rev_002" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HostResponseRequest" },
                  examples: {
                    positiveResponse: {
                      summary: "POST — host thanks guest",
                      value: {
                        hostId: "host123",
                        comment: "Thank you so much for the kind words, Marco! It was a pleasure having you. Hope to welcome you back soon!"
                      }
                    },
                    constructiveResponse: {
                      summary: "POST — host addresses a concern",
                      value: {
                        hostId: "host123",
                        comment: "Thank you for your feedback. We have since updated the listing description to be more accurate. We take all feedback seriously."
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Host response submitted successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/HostResponseResult" },
                    examples: {
                      responseAdded: {
                        summary: "201 — response successfully posted",
                        value: {
                          reviewId: "rev_002",
                          hostId: "host123",
                          comment: "Thank you so much for the kind words, Marco! It was a pleasure having you.",
                          createdAt: "2026-02-10T11:30:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "403": {
                description: "Forbidden — caller is not the host of this listing",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notHost: {
                        summary: "403 — user is not the listing's host",
                        value: { code: "ACCESS_DENIED", message: "Only the host of listing listing_nyc_001 can respond to its reviews." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "Host response already exists for this review",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyResponded: {
                        summary: "409 — host has already responded",
                        value: { code: "RESPONSE_ALREADY_EXISTS", message: "A response to review rev_002 has already been posted." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/listings/{listingId}/reviews/{reviewId}/helpful": {
          post: {
            tags: ["Write Reviews"],
            summary: "Mark a review as helpful",
            description: "Increments the helpful count on a review. A user can only mark each review helpful once.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "reviewId", in: "path", required: true, schema: { type: "string" }, example: "rev_001" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { type: "object", properties: { userId: { type: "string", example: "cust005" } } },
                  examples: {
                    markHelpful: {
                      summary: "POST — mark review as helpful",
                      value: { userId: "cust005" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Helpful count updated successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/HelpfulResponse" },
                    examples: {
                      updated: {
                        summary: "200 — helpful vote recorded, count incremented",
                        value: { reviewId: "rev_001", helpfulCount: 15, votedBy: "cust005" }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Review not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "404 — review ID does not exist",
                        value: { code: "REVIEW_NOT_FOUND", message: "No review found with ID rev_999 for listing listing_nyc_001." }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "User has already voted this review helpful",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyVoted: {
                        summary: "409 — duplicate helpful vote",
                        value: { code: "ALREADY_VOTED_HELPFUL", message: "User cust005 has already marked review rev_001 as helpful." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/listings/{listingId}/reviews/{reviewId}/flag": {
          post: {
            tags: ["Write Reviews"],
            summary: "Flag a review as inappropriate",
            description: "Allows any user to report a review that violates community guidelines. Flagged reviews are queued for moderation.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "reviewId", in: "path", required: true, schema: { type: "string" }, example: "rev_009" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FlagRequest" },
                  examples: {
                    spam: {
                      summary: "POST — flag as spam",
                      value: { reportedBy: "cust012", reason: "spam", details: "This review appears to be a copied template posted across multiple listings." }
                    },
                    offensive: {
                      summary: "POST — flag as offensive content",
                      value: { reportedBy: "host123", reason: "offensive_content", details: "The review contains personal attacks and inappropriate language." }
                    },
                    notAGuest: {
                      summary: "POST — flag as not a real guest",
                      value: { reportedBy: "host123", reason: "not_a_guest", details: "This person's booking was cancelled before check-in." }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Review flagged and queued for moderation",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/FlagResponse" },
                    examples: {
                      flagged: {
                        summary: "200 — flag submitted, pending moderation review",
                        value: {
                          reviewId: "rev_009",
                          flagId: "flag_001",
                          reportedBy: "cust012",
                          reason: "spam",
                          status: "pending_review",
                          submittedAt: "2026-03-10T08:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request — missing or invalid flag reason",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      missingReason: {
                        summary: "400 — reason field is required",
                        value: { code: "MISSING_FIELD", message: "The 'reason' field is required when flagging a review." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Review not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "404 — review ID does not exist",
                        value: { code: "REVIEW_NOT_FOUND", message: "No review found with ID rev_999 for listing listing_nyc_001." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // GUEST'S REVIEW HISTORY
        // ─────────────────────────────────────────

        "/guests/{guestId}/reviews": {
          get: {
            tags: ["Read Reviews"],
            summary: "Get all reviews written by a guest",
            description: "Returns all reviews a guest has posted across all their past bookings.",
            parameters: [
              { name: "guestId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Guest review history returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/GuestReviewHistoryResponse" },
                    examples: {
                      guestHistory: {
                        summary: "200 — guest has posted multiple reviews",
                        value: {
                          guestId: "cust001",
                          totalReviews: 2,
                          page: 1,
                          limit: 10,
                          reviews: [
                            {
                              reviewId: "rev_215",
                              listingId: "listing_nyc_001",
                              listingTitle: "Cozy Manhattan Loft in Midtown",
                              rating: 5,
                              comment: "One of the best Airbnb stays I have ever had. The place was immaculate.",
                              createdAt: "2026-04-15T10:00:00Z"
                            },
                            {
                              reviewId: "rev_130",
                              listingId: "listing_miami_003",
                              listingTitle: "Beachfront Studio in South Beach",
                              rating: 5,
                              comment: "Perfect location, steps from the beach. Clean, modern, and exactly as described.",
                              createdAt: "2026-02-18T09:00:00Z"
                            }
                          ]
                        }
                      },
                      noReviews: {
                        summary: "200 — guest has not written any reviews yet",
                        value: {
                          guestId: "cust099",
                          totalReviews: 0,
                          page: 1,
                          limit: 10,
                          reviews: []
                        }
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
        // AI SUMMARY
        // ─────────────────────────────────────────

        "/listings/{listingId}/reviews/ai-summary": {
          get: {
            tags: ["AI Review Summary"],
            summary: "Get AI-generated summary of all reviews for a listing",
            description: "Returns an AI-generated narrative summary condensed from all available guest reviews. Highlights praised aspects, common concerns, category insights, and representative quotes.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "language", in: "query", required: false, schema: { type: "string" }, example: "en", description: "Language for the AI summary output (ISO 639-1). Defaults to en." }
            ],
            responses: {
              "200": {
                description: "AI-generated review summary returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AISummaryResponse" },
                    examples: {
                      fullSummary: {
                        summary: "200 — full summary for a well-reviewed listing",
                        value: {
                          listingId: "listing_nyc_001",
                          reviewsAnalysed: 214,
                          language: "en",
                          generatedAt: "2026-03-01T06:00:00Z",
                          overallSentiment: "very_positive",
                          overallRating: 4.87,
                          summary: "Guests consistently describe this Midtown Manhattan loft as a standout Airbnb experience. Cleanliness, host communication, and location are the top three praised attributes across nearly all reviews. Street noise and value are the only recurring minor concerns.",
                          highlights: [
                            { aspect: "Cleanliness", sentiment: "very_positive", mentionCount: 189, excerpt: "Spotlessly clean on arrival, better than a hotel." },
                            { aspect: "Host Communication", sentiment: "very_positive", mentionCount: 176, excerpt: "John replied within minutes every time — incredible host." },
                            { aspect: "Street Noise", sentiment: "slightly_negative", mentionCount: 34, excerpt: "A bit loud at night with windows open, but expected for NYC." }
                          ],
                          categoryInsights: {
                            cleanliness: { score: 4.9, insight: "Consistently rated as the listing's strongest attribute." },
                            checkIn: { score: 4.95, insight: "Self check-in process is seamless and highly praised." },
                            value: { score: 4.6, insight: "Rated slightly lower; long-stay guests find it most worthwhile." }
                          },
                          representativeQuotes: [
                            { reviewId: "rev_001", guestName: "Alice J.", quote: "Absolutely fantastic stay! Spotlessly clean and John was incredibly responsive.", rating: 5 },
                            { reviewId: "rev_099", guestName: "Liam T.", quote: "Great host and great space. Street noise is real but part of the NYC charm.", rating: 4 }
                          ],
                          lastUpdated: "2026-03-01T06:00:00Z"
                        }
                      },
                      fewReviews: {
                        summary: "200 — early-stage listing with only a few reviews",
                        value: {
                          listingId: "listing_new_001",
                          reviewsAnalysed: 3,
                          language: "en",
                          generatedAt: "2026-03-01T06:00:00Z",
                          overallSentiment: "positive",
                          overallRating: 4.67,
                          summary: "Early guests have responded very positively. Cleanliness and host communication are highlighted in all three reviews. The summary will become more detailed as more guests share their experiences.",
                          highlights: [
                            { aspect: "Cleanliness", sentiment: "very_positive", mentionCount: 3, excerpt: "Very clean and well-maintained." }
                          ],
                          categoryInsights: {
                            cleanliness: { score: 4.7, insight: "Mentioned positively by all early guests." }
                          },
                          representativeQuotes: [
                            { reviewId: "rev_301", guestName: "Tom H.", quote: "Great first Airbnb experience. Clean, comfortable, and the host was brilliant.", rating: 5 }
                          ],
                          lastUpdated: "2026-03-01T06:00:00Z"
                        }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Listing not found or no reviews available yet",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      noReviews: {
                        summary: "404 — listing has no reviews yet",
                        value: { code: "NO_REVIEWS_AVAILABLE", message: "Listing listing_brand_new has no reviews yet. AI summary will be available after the first guest review is submitted." }
                      },
                      listingNotFound: {
                        summary: "404 — listing ID does not exist",
                        value: { code: "LISTING_NOT_FOUND", message: "No listing found with ID listing_xyz_999." }
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

          CategoryRatings: {
            type: "object",
            properties: {
              cleanliness: { type: "number", format: "float", example: 5.0 },
              accuracy: { type: "number", format: "float", example: 5.0 },
              checkIn: { type: "number", format: "float", example: 5.0 },
              communication: { type: "number", format: "float", example: 5.0 },
              location: { type: "number", format: "float", example: 4.0 },
              value: { type: "number", format: "float", example: 5.0 }
            }
          },

          HostResponse: {
            type: "object",
            nullable: true,
            properties: {
              comment: { type: "string", example: "Thank you for the feedback Marco! Hope to host you again!" },
              createdAt: { type: "string", format: "date-time", example: "2026-02-10T11:30:00Z" }
            }
          },

          Review: {
            type: "object",
            properties: {
              reviewId: { type: "string", example: "rev_001" },
              bookingId: { type: "string", example: "booking_090" },
              listingId: { type: "string", example: "listing_nyc_001" },
              guestId: { type: "string", example: "cust001" },
              guestName: { type: "string", example: "Alice J." },
              guestAvatar: { type: "string", example: "https://cdn.example.com/avatars/cust001.jpg" },
              rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
              categoryRatings: { $ref: "#/components/schemas/CategoryRatings" },
              comment: { type: "string", example: "Absolutely fantastic stay! The loft was spotlessly clean." },
              language: { type: "string", example: "en" },
              helpfulCount: { type: "integer", example: 14 },
              hostResponse: { $ref: "#/components/schemas/HostResponse" },
              createdAt: { type: "string", format: "date-time", example: "2026-02-18T09:00:00Z" }
            }
          },

          ReviewListResponse: {
            type: "object",
            properties: {
              listingId: { type: "string", example: "listing_nyc_001" },
              totalCount: { type: "integer", example: 214 },
              averageRating: { type: "number", format: "float", example: 4.87 },
              ratingBreakdown: { type: "object", example: { "5": 172, "4": 31, "3": 8, "2": 2, "1": 1 } },
              categoryRatings: { $ref: "#/components/schemas/CategoryRatings" },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              reviews: { type: "array", items: { $ref: "#/components/schemas/Review" } }
            }
          },

          ReviewCreateRequest: {
            type: "object",
            properties: {
              bookingId: { type: "string", example: "booking_101" },
              guestId: { type: "string", example: "cust001" },
              rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
              categoryRatings: { $ref: "#/components/schemas/CategoryRatings" },
              comment: { type: "string", example: "One of the best Airbnb stays I have ever had." }
            }
          },

          HostResponseRequest: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              comment: { type: "string", example: "Thank you so much for the kind words! Hope to welcome you back soon." }
            }
          },

          HostResponseResult: {
            type: "object",
            properties: {
              reviewId: { type: "string", example: "rev_002" },
              hostId: { type: "string", example: "host123" },
              comment: { type: "string", example: "Thank you so much for the kind words! Hope to welcome you back soon." },
              createdAt: { type: "string", format: "date-time", example: "2026-02-10T11:30:00Z" }
            }
          },

          HelpfulResponse: {
            type: "object",
            properties: {
              reviewId: { type: "string", example: "rev_001" },
              helpfulCount: { type: "integer", example: 15 },
              votedBy: { type: "string", example: "cust005" }
            }
          },

          FlagRequest: {
            type: "object",
            properties: {
              reportedBy: { type: "string", example: "cust012" },
              reason: { type: "string", enum: ["spam", "offensive_content", "not_a_guest", "fake_review", "irrelevant"], example: "spam" },
              details: { type: "string", example: "This review appears to be a copied template." }
            }
          },

          FlagResponse: {
            type: "object",
            properties: {
              reviewId: { type: "string", example: "rev_009" },
              flagId: { type: "string", example: "flag_001" },
              reportedBy: { type: "string", example: "cust012" },
              reason: { type: "string", example: "spam" },
              status: { type: "string", enum: ["pending_review", "resolved_removed", "resolved_kept"], example: "pending_review" },
              submittedAt: { type: "string", format: "date-time", example: "2026-03-10T08:00:00Z" }
            }
          },

          GuestReviewHistoryResponse: {
            type: "object",
            properties: {
              guestId: { type: "string", example: "cust001" },
              totalReviews: { type: "integer", example: 3 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              reviews: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    reviewId: { type: "string", example: "rev_215" },
                    listingId: { type: "string", example: "listing_nyc_001" },
                    listingTitle: { type: "string", example: "Cozy Manhattan Loft in Midtown" },
                    rating: { type: "integer", example: 5 },
                    comment: { type: "string", example: "One of the best Airbnb stays I have ever had." },
                    createdAt: { type: "string", format: "date-time", example: "2026-04-15T10:00:00Z" }
                  }
                }
              }
            }
          },

          AISummaryHighlight: {
            type: "object",
            properties: {
              aspect: { type: "string", example: "Cleanliness" },
              sentiment: { type: "string", enum: ["very_positive", "positive", "mixed", "slightly_negative", "negative"], example: "very_positive" },
              mentionCount: { type: "integer", example: 189 },
              excerpt: { type: "string", example: "Spotlessly clean on arrival, better than a hotel." }
            }
          },

          AISummaryCategoryInsight: {
            type: "object",
            properties: {
              score: { type: "number", format: "float", example: 4.9 },
              insight: { type: "string", example: "Consistently rated as the listing's strongest attribute." }
            }
          },

          AISummaryQuote: {
            type: "object",
            properties: {
              reviewId: { type: "string", example: "rev_001" },
              guestName: { type: "string", example: "Alice J." },
              quote: { type: "string", example: "Absolutely fantastic stay! The loft was spotlessly clean and John was incredibly responsive." },
              rating: { type: "integer", example: 5 }
            }
          },

          AISummaryResponse: {
            type: "object",
            properties: {
              listingId: { type: "string", example: "listing_nyc_001" },
              reviewsAnalysed: { type: "integer", example: 214 },
              language: { type: "string", example: "en" },
              generatedAt: { type: "string", format: "date-time", example: "2026-03-01T06:00:00Z" },
              overallSentiment: { type: "string", enum: ["very_positive", "positive", "mixed", "negative", "very_negative"], example: "very_positive" },
              overallRating: { type: "number", format: "float", example: 4.87 },
              summary: { type: "string", example: "Guests consistently describe this loft as a standout Airbnb experience..." },
              highlights: { type: "array", items: { $ref: "#/components/schemas/AISummaryHighlight" } },
              categoryInsights: {
                type: "object",
                properties: {
                  cleanliness: { $ref: "#/components/schemas/AISummaryCategoryInsight" },
                  accuracy: { $ref: "#/components/schemas/AISummaryCategoryInsight" },
                  checkIn: { $ref: "#/components/schemas/AISummaryCategoryInsight" },
                  communication: { $ref: "#/components/schemas/AISummaryCategoryInsight" },
                  location: { $ref: "#/components/schemas/AISummaryCategoryInsight" },
                  value: { $ref: "#/components/schemas/AISummaryCategoryInsight" }
                }
              },
              representativeQuotes: { type: "array", items: { $ref: "#/components/schemas/AISummaryQuote" } },
              lastUpdated: { type: "string", format: "date-time", example: "2026-03-01T06:00:00Z" }
            }
          },

          ErrorResponse: {
            type: "object",
            properties: {
              code: { type: "string", example: "REVIEW_NOT_FOUND" },
              message: { type: "string", example: "No review found with ID rev_999 for listing listing_nyc_001" }
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
