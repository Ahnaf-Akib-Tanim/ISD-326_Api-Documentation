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
            description: "Returns paginated guest reviews for a listing, with optional filters by rating, language, and keyword. Used to render the reviews section on a listing page.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "minRating", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 5 }, example: 4, description: "Filter reviews at or above this star rating" },
              { name: "maxRating", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 5 }, example: 5, description: "Filter reviews at or below this star rating" },
              { name: "language", in: "query", required: false, schema: { type: "string" }, example: "en", description: "ISO 639-1 language code to filter reviews by language" },
              { name: "keyword", in: "query", required: false, schema: { type: "string" }, example: "clean", description: "Keyword to search within review text" },
              { name: "sortBy", in: "query", required: false, schema: { type: "string", enum: ["newest", "oldest", "highest_rating", "lowest_rating", "most_helpful"] }, example: "newest" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Paginated list of reviews",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ReviewListResponse" },
                    examples: {
                      allReviews: {
                        summary: "GET /listings/listing_nyc_001/reviews?sortBy=newest&limit=10",
                        value: {
                          listingId: "listing_nyc_001",
                          totalCount: 214,
                          averageRating: 4.87,
                          ratingBreakdown: { "5": 172, "4": 31, "3": 8, "2": 2, "1": 1 },
                          categoryRatings: {
                            cleanliness: 4.9,
                            accuracy: 4.8,
                            checkIn: 4.95,
                            communication: 4.9,
                            location: 4.7,
                            value: 4.6
                          },
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
                              comment: "Absolutely fantastic stay! The loft was spotlessly clean, exactly as described, and John was incredibly responsive. The location in Midtown couldn't be better — steps from everything. Will definitely be back.",
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
                              comment: "Great stay overall. The apartment was clean and well-located. Only minor issue was the street noise at night, but nothing terrible. Host replied quickly to all messages.",
                              language: "en",
                              helpfulCount: 7,
                              hostResponse: {
                                comment: "Thank you for the feedback Marco! We appreciate the kind words and we're looking into window improvements to address the street noise. Hope to host you again!",
                                createdAt: "2026-02-10T11:30:00Z"
                              },
                              createdAt: "2026-02-08T14:00:00Z"
                            }
                          ]
                        }
                      },
                      filteredByRating: {
                        summary: "GET /listings/listing_nyc_001/reviews?minRating=5&keyword=clean",
                        value: {
                          listingId: "listing_nyc_001",
                          totalCount: 172,
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
                              comment: "Absolutely fantastic stay! The loft was spotlessly clean, exactly as described.",
                              language: "en",
                              helpfulCount: 14,
                              hostResponse: null,
                              createdAt: "2026-02-18T09:00:00Z"
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

        "/listings/{listingId}/reviews/{reviewId}": {
          get: {
            tags: ["Read Reviews"],
            summary: "Get a single review by ID",
            description: "Returns the full detail of one review including all category ratings, the guest profile, and any host response.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "reviewId", in: "path", required: true, schema: { type: "string" }, example: "rev_001" }
            ],
            responses: {
              "200": {
                description: "Review detail",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Review" },
                    examples: {
                      reviewDetail: {
                        summary: "GET /listings/listing_nyc_001/reviews/rev_001",
                        value: {
                          reviewId: "rev_001",
                          bookingId: "booking_090",
                          listingId: "listing_nyc_001",
                          guestId: "cust001",
                          guestName: "Alice J.",
                          guestAvatar: "https://cdn.example.com/avatars/cust001.jpg",
                          rating: 5,
                          categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 4, value: 5 },
                          comment: "Absolutely fantastic stay! The loft was spotlessly clean, exactly as described, and John was incredibly responsive. The location in Midtown couldn't be better — steps from everything. Will definitely be back.",
                          language: "en",
                          helpfulCount: 14,
                          hostResponse: null,
                          createdAt: "2026-02-18T09:00:00Z"
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
                        summary: "Review does not exist",
                        value: { code: "REVIEW_NOT_FOUND", message: "No review found with ID rev_999 for listing listing_nyc_001" }
                      }
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

        "/listings/{listingId}/reviews": {
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
                      summary: "POST /listings/listing_nyc_001/reviews — 5-star review",
                      value: {
                        bookingId: "booking_101",
                        guestId: "cust001",
                        rating: 5,
                        categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
                        comment: "One of the best Airbnb stays I have ever had. The place was immaculate, the host John went above and beyond, and the Midtown location made everything so convenient. Already looking forward to my next visit!"
                      }
                    },
                    fourStar: {
                      summary: "POST /listings/listing_nyc_001/reviews — 4-star review with constructive feedback",
                      value: {
                        bookingId: "booking_104",
                        guestId: "cust007",
                        rating: 4,
                        categoryRatings: { cleanliness: 5, accuracy: 4, checkIn: 5, communication: 4, location: 4, value: 3 },
                        comment: "Great apartment and very clean. The host was responsive. Price felt a little high for the size but the location makes up for it. Would stay again."
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
                        summary: "Review created",
                        value: {
                          reviewId: "rev_215",
                          bookingId: "booking_101",
                          listingId: "listing_nyc_001",
                          guestId: "cust001",
                          guestName: "Alice J.",
                          guestAvatar: "https://cdn.example.com/avatars/cust001.jpg",
                          rating: 5,
                          categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
                          comment: "One of the best Airbnb stays I have ever had. The place was immaculate, the host John went above and beyond.",
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
                        summary: "Duplicate review attempt",
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
                        summary: "14-day review window has passed",
                        value: { code: "REVIEW_WINDOW_EXPIRED", message: "Reviews must be submitted within 14 days of checkout. Checkout was 2026-02-01." }
                      },
                      bookingNotCompleted: {
                        summary: "Booking not yet completed",
                        value: { code: "BOOKING_NOT_COMPLETED", message: "Reviews can only be submitted after a stay is completed. Current status: confirmed." }
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
                      summary: "POST /listings/listing_nyc_001/reviews/rev_002/response — host thanks guest",
                      value: {
                        hostId: "host123",
                        comment: "Thank you so much for the kind words, Marco! It was a pleasure having you. We appreciate the honest feedback about the street noise and have since added blackout curtains and thicker window seals. Hope to welcome you back soon!"
                      }
                    },
                    constructiveResponse: {
                      summary: "POST /listings/listing_nyc_001/reviews/rev_002/response — host addresses concerns",
                      value: {
                        hostId: "host123",
                        comment: "Thank you for your feedback. I am sorry the apartment didn't fully meet your expectations. We have since updated the listing description to be more detailed about the space. We take all feedback seriously and are always working to improve."
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Host response submitted",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/HostResponseResult" },
                    examples: {
                      responseAdded: {
                        summary: "Response successfully posted",
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
              "409": {
                description: "Host response already exists",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyResponded: {
                        summary: "Host has already responded to this review",
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
            description: "Increments the helpful count on a review. Used to surface the most useful reviews. A user can only mark each review helpful once.",
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
                      summary: "POST /listings/listing_nyc_001/reviews/rev_001/helpful",
                      value: { userId: "cust005" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Helpful count updated",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/HelpfulResponse" },
                    examples: {
                      updated: {
                        summary: "Helpful vote recorded",
                        value: { reviewId: "rev_001", helpfulCount: 15, votedBy: "cust005" }
                      }
                    }
                  }
                }
              },
              "409": {
                description: "User already voted this review helpful",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      alreadyVoted: {
                        summary: "Duplicate helpful vote",
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
                      summary: "POST /listings/listing_nyc_001/reviews/rev_009/flag — spam",
                      value: { reportedBy: "cust012", reason: "spam", details: "This review appears to be a copied template posted across multiple listings." }
                    },
                    offensive: {
                      summary: "POST /listings/listing_nyc_001/reviews/rev_009/flag — offensive content",
                      value: { reportedBy: "host123", reason: "offensive_content", details: "The review contains personal attacks and inappropriate language unrelated to the stay." }
                    },
                    notAGuest: {
                      summary: "POST /listings/listing_nyc_001/reviews/rev_009/flag — reviewer never stayed",
                      value: { reportedBy: "host123", reason: "not_a_guest", details: "This person was not a guest at our listing. The booking was cancelled before check-in." }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Review flagged for moderation",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/FlagResponse" },
                    examples: {
                      flagged: {
                        summary: "Review queued for moderation",
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
            description: "Returns all reviews a guest has posted across all their past bookings. Used to render the guest's public review history on their profile.",
            parameters: [
              { name: "guestId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Guest's review history",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/GuestReviewHistoryResponse" },
                    examples: {
                      guestHistory: {
                        summary: "GET /guests/cust001/reviews",
                        value: {
                          guestId: "cust001",
                          totalReviews: 3,
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
            description: "Returns an AI-generated narrative summary condensed from all available guest reviews for the listing. Highlights the most frequently praised aspects, common concerns, category-level insights, and representative guest quotes. The summary is regenerated periodically as new reviews come in.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "language", in: "query", required: false, schema: { type: "string" }, example: "en", description: "Language for the AI summary output (ISO 639-1). Defaults to en." }
            ],
            responses: {
              "200": {
                description: "AI-generated review summary",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AISummaryResponse" },
                    examples: {
                      fullSummary: {
                        summary: "GET /listings/listing_nyc_001/reviews/ai-summary",
                        value: {
                          listingId: "listing_nyc_001",
                          reviewsAnalysed: 214,
                          language: "en",
                          generatedAt: "2026-03-01T06:00:00Z",
                          overallSentiment: "very_positive",
                          overallRating: 4.87,
                          summary: "Guests consistently describe this Midtown Manhattan loft as a standout Airbnb experience. The overwhelming majority of reviews highlight the exceptional cleanliness, with many guests noting the apartment was immaculate on arrival. The host John is frequently praised for his fast, helpful communication and attention to detail. The central Midtown location receives strong praise for its walkability to Times Square, Central Park, and major transit hubs. A small number of guests mention street noise as a minor downside, though most consider it typical for Manhattan. Value for money divides opinion slightly — guests on longer stays tend to feel the price is justified, while those on shorter visits occasionally feel it skews high. Overall, this listing is one of the top-rated options in the area with an extremely loyal repeat guest rate.",
                          highlights: [
                            { aspect: "Cleanliness", sentiment: "very_positive", mentionCount: 189, excerpt: "Spotlessly clean on arrival, better than a hotel." },
                            { aspect: "Host Communication", sentiment: "very_positive", mentionCount: 176, excerpt: "John replied within minutes every time — incredible host." },
                            { aspect: "Location", sentiment: "very_positive", mentionCount: 161, excerpt: "Can't beat Midtown — walked everywhere we wanted to go." },
                            { aspect: "Check-in", sentiment: "very_positive", mentionCount: 148, excerpt: "Seamless self check-in, clear instructions, no issues at all." },
                            { aspect: "Street Noise", sentiment: "slightly_negative", mentionCount: 34, excerpt: "A bit loud at night with windows open, but expected for NYC." },
                            { aspect: "Value", sentiment: "mixed", mentionCount: 51, excerpt: "Pricey for the size, but the location and quality justify it for us." }
                          ],
                          categoryInsights: {
                            cleanliness: { score: 4.9, insight: "Consistently rated as the listing's strongest attribute across all review periods." },
                            accuracy: { score: 4.8, insight: "Photos and description closely match the actual space according to most guests." },
                            checkIn: { score: 4.95, insight: "Self check-in process is seamless and highly praised by nearly all guests." },
                            communication: { score: 4.9, insight: "Host is known for fast, clear responses — frequently mentioned by name in reviews." },
                            location: { score: 4.7, insight: "Prime Midtown location is a major positive; only guests seeking quieter areas rate this lower." },
                            value: { score: 4.6, insight: "Rated slightly lower than other categories; long-stay guests and families find it most worthwhile." }
                          },
                          representativeQuotes: [
                            { reviewId: "rev_001", guestName: "Alice J.", quote: "Absolutely fantastic stay! The loft was spotlessly clean, exactly as described, and John was incredibly responsive.", rating: 5 },
                            { reviewId: "rev_045", guestName: "Sarah M.", quote: "The check-in was seamless, the apartment beautiful, and the location unbeatable. A perfect NYC base.", rating: 5 },
                            { reviewId: "rev_099", guestName: "Liam T.", quote: "Great host and great space. Street noise is real but part of the NYC charm. Would book again.", rating: 4 }
                          ],
                          lastUpdated: "2026-03-01T06:00:00Z"
                        }
                      },
                      fewReviews: {
                        summary: "GET /listings/listing_new_001/reviews/ai-summary — listing with few reviews",
                        value: {
                          listingId: "listing_new_001",
                          reviewsAnalysed: 3,
                          language: "en",
                          generatedAt: "2026-03-01T06:00:00Z",
                          overallSentiment: "positive",
                          overallRating: 4.67,
                          summary: "Early guests have responded very positively to this listing. Cleanliness and host communication are highlighted in all three reviews so far. With only a small number of reviews available, the summary will become more detailed and accurate as more guests share their experiences.",
                          highlights: [
                            { aspect: "Cleanliness", sentiment: "very_positive", mentionCount: 3, excerpt: "Very clean and well-maintained." },
                            { aspect: "Host Communication", sentiment: "very_positive", mentionCount: 3, excerpt: "Host was friendly and easy to reach." }
                          ],
                          categoryInsights: {
                            cleanliness: { score: 4.7, insight: "Mentioned positively by all early guests." },
                            communication: { score: 4.8, insight: "Host responsiveness is a consistent early theme." }
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
                description: "Listing not found or no reviews yet",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      noReviews: {
                        summary: "No reviews available for AI summary",
                        value: { code: "NO_REVIEWS_AVAILABLE", message: "Listing listing_brand_new has no reviews yet. AI summary will be available after the first guest review is submitted." }
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
              ratingBreakdown: {
                type: "object",
                example: { "5": 172, "4": 31, "3": 8, "2": 2, "1": 1 }
              },
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
              comment: { type: "string", example: "One of the best Airbnb stays I have ever had. The place was immaculate." }
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
              insight: { type: "string", example: "Consistently rated as the listing's strongest attribute across all review periods." }
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
              reviewsAnalysed: { type: "integer", example: 214, description: "Total number of reviews used to generate this summary" },
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
