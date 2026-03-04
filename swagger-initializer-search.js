window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: {
      openapi: "3.0.3",
      info: {
        title: "Search & Destination Discovery API",
        version: "1.0.0",
        description: "APIs to search for hotels and apartments, get personalized destination suggestions based on a customer's recent searches, and surface worldwide trending destinations on the Airbnb platform."
      },
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "http://localhost:3000", description: "Local dev" }
      ],
      security: [{ bearerAuth: [] }],
      paths: {

        // ─────────────────────────────────────────
        // SEARCH
        // ─────────────────────────────────────────

        "/search/listings": {
          get: {
            tags: ["Search"],
            summary: "Search for hotels and apartments",
            description: "Main search endpoint. Returns paginated listings matching location, dates, guests, price range, property type, and amenity filters.",
            parameters: [
              { name: "location", in: "query", required: true, schema: { type: "string" }, example: "New York, NY", description: "City, region, landmark, or address to search in" },
              { name: "checkIn", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-04-10", description: "Check-in date" },
              { name: "checkOut", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-04-14", description: "Check-out date" },
              { name: "adults", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 2, description: "Number of adult guests" },
              { name: "children", in: "query", required: false, schema: { type: "integer", default: 0 }, example: 1, description: "Number of child guests" },
              { name: "infants", in: "query", required: false, schema: { type: "integer", default: 0 }, example: 0, description: "Number of infants" },
              { name: "propertyType", in: "query", required: false, schema: { type: "string", enum: ["any", "hotel", "apartment", "house", "villa", "cabin", "hostel"] }, example: "apartment", description: "Filter by property type" },
              { name: "minPrice", in: "query", required: false, schema: { type: "number" }, example: 50, description: "Minimum price per night (USD)" },
              { name: "maxPrice", in: "query", required: false, schema: { type: "number" }, example: 300, description: "Maximum price per night (USD)" },
              { name: "minRating", in: "query", required: false, schema: { type: "number", minimum: 0, maximum: 5 }, example: 4.0, description: "Minimum guest rating" },
              { name: "amenities", in: "query", required: false, schema: { type: "string" }, example: "wifi,pool,kitchen", description: "Comma-separated list of required amenities" },
              { name: "instantBook", in: "query", required: false, schema: { type: "boolean" }, example: true, description: "Only show instant-book listings" },
              { name: "sortBy", in: "query", required: false, schema: { type: "string", enum: ["relevance", "price_asc", "price_desc", "rating", "newest"] }, example: "rating", description: "Sort order for results" },
              { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 20 }, example: 20 }
            ],
            responses: {
              "200": {
                description: "Search results returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/SearchResultsResponse" },
                    examples: {
                      apartmentSearch: {
                        summary: "Apartments in New York",
                        value: {
                          query: { location: "New York, NY", checkIn: "2026-04-10", checkOut: "2026-04-14", adults: 2, children: 0, propertyType: "apartment" },
                          totalCount: 148,
                          page: 1,
                          limit: 20,
                          listings: [
                            {
                              listingId: "listing_nyc_001",
                              title: "Cozy Manhattan Loft in Midtown",
                              propertyType: "apartment",
                              location: { city: "New York", neighborhood: "Midtown", country: "US", lat: 40.7549, lng: -73.9840 },
                              pricePerNight: 130.00,
                              currency: "USD",
                              totalPrice: 520.00,
                              rating: 4.87,
                              reviewCount: 214,
                              maxGuests: 4,
                              bedrooms: 1,
                              bathrooms: 1,
                              amenities: ["wifi", "kitchen", "washer", "air_conditioning"],
                              instantBook: true,
                              thumbnail: "https://cdn.example.com/listings/nyc_001/thumb.jpg",
                              isSuperhost: true
                            },
                            {
                              listingId: "listing_nyc_002",
                              title: "Bright Studio near Central Park",
                              propertyType: "apartment",
                              location: { city: "New York", neighborhood: "Upper West Side", country: "US", lat: 40.7831, lng: -73.9712 },
                              pricePerNight: 95.00,
                              currency: "USD",
                              totalPrice: 380.00,
                              rating: 4.72,
                              reviewCount: 89,
                              maxGuests: 2,
                              bedrooms: 0,
                              bathrooms: 1,
                              amenities: ["wifi", "kitchen", "gym"],
                              instantBook: false,
                              thumbnail: "https://cdn.example.com/listings/nyc_002/thumb.jpg",
                              isSuperhost: false
                            }
                          ]
                        }
                      },
                      hotelSearch: {
                        summary: "Hotels in Paris with high rating",
                        value: {
                          query: { location: "Paris, France", propertyType: "hotel", minRating: 4.5, sortBy: "rating" },
                          totalCount: 37,
                          page: 1,
                          limit: 20,
                          listings: [
                            {
                              listingId: "listing_par_011",
                              title: "Boutique Hotel near Eiffel Tower",
                              propertyType: "hotel",
                              location: { city: "Paris", neighborhood: "7th Arrondissement", country: "FR", lat: 48.8566, lng: 2.3522 },
                              pricePerNight: 210.00,
                              currency: "USD",
                              totalPrice: null,
                              rating: 4.94,
                              reviewCount: 502,
                              maxGuests: 2,
                              bedrooms: 1,
                              bathrooms: 1,
                              amenities: ["wifi", "breakfast", "concierge", "pool"],
                              instantBook: true,
                              thumbnail: "https://cdn.example.com/listings/par_011/thumb.jpg",
                              isSuperhost: false
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad Request — missing required parameter or invalid filter values",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      missingLocation: {
                        summary: "Location not provided",
                        value: { code: "MISSING_PARAMETER", message: "Query parameter 'location' is required." }
                      },
                      invalidDateRange: {
                        summary: "Check-out before check-in",
                        value: { code: "INVALID_DATE_RANGE", message: "'checkOut' date must be after 'checkIn' date." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — no listings available for the given location",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      noResults: {
                        summary: "Location not recognized",
                        value: { code: "LOCATION_NOT_FOUND", message: "No listings were found for location 'Xyz Village, ZZ'. Try a different search." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/search/listings/{listingId}": {
          get: {
            tags: ["Search"],
            summary: "Get full details of a listing",
            description: "Returns complete listing details including all photos, amenities, host info, availability calendar summary, house rules, and review highlights.",
            parameters: [
              { name: "listingId", in: "path", required: true, schema: { type: "string" }, example: "listing_nyc_001" },
              { name: "checkIn", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-04-10" },
              { name: "checkOut", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-04-14" },
              { name: "adults", in: "query", required: false, schema: { type: "integer" }, example: 2 }
            ],
            responses: {
              "200": {
                description: "Full listing details retrieved successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ListingDetail" },
                    examples: {
                      listingDetail: {
                        summary: "Available listing with pricing breakdown",
                        value: {
                          listingId: "listing_nyc_001",
                          title: "Cozy Manhattan Loft in Midtown",
                          description: "A beautifully furnished loft in the heart of Midtown Manhattan, walking distance to Times Square and Central Park.",
                          propertyType: "apartment",
                          location: {
                            address: "350 W 42nd St",
                            city: "New York",
                            neighborhood: "Midtown",
                            state: "NY",
                            country: "US",
                            lat: 40.7549,
                            lng: -73.9840
                          },
                          host: {
                            hostId: "host123",
                            name: "John Host",
                            isSuperhost: true,
                            rating: 4.95,
                            responseRate: 98,
                            responseTime: "within an hour",
                            memberSince: "2019-06-01"
                          },
                          pricePerNight: 130.00,
                          currency: "USD",
                          totalPrice: 520.00,
                          pricingBreakdown: {
                            basePrice: 520.00,
                            cleaningFee: 45.00,
                            serviceFee: 78.00,
                            taxes: 52.00,
                            grandTotal: 695.00
                          },
                          rating: 4.87,
                          reviewCount: 214,
                          maxGuests: 4,
                          bedrooms: 1,
                          beds: 1,
                          bathrooms: 1,
                          amenities: ["wifi", "kitchen", "washer", "air_conditioning", "tv", "elevator", "hair_dryer"],
                          photos: [
                            "https://cdn.example.com/listings/nyc_001/photo1.jpg",
                            "https://cdn.example.com/listings/nyc_001/photo2.jpg",
                            "https://cdn.example.com/listings/nyc_001/photo3.jpg"
                          ],
                          houseRules: { checkInTime: "15:00", checkOutTime: "11:00", smokingAllowed: false, petsAllowed: false, partiesAllowed: false },
                          cancellationPolicy: "moderate",
                          instantBook: true,
                          availabilityStatus: "available"
                        }
                      },
                      unavailableListing: {
                        summary: "Listing exists but unavailable for dates",
                        value: {
                          listingId: "listing_nyc_003",
                          title: "SoHo Penthouse with Rooftop Access",
                          propertyType: "apartment",
                          location: { address: "120 Spring St", city: "New York", neighborhood: "SoHo", state: "NY", country: "US", lat: 40.7243, lng: -74.0018 },
                          pricePerNight: 275.00,
                          currency: "USD",
                          totalPrice: null,
                          availabilityStatus: "unavailable",
                          instantBook: false,
                          rating: 4.91,
                          reviewCount: 76
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
                        value: { code: "UNAUTHORIZED", message: "Your session has expired. Please re-authenticate." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — listing does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Listing not found",
                        value: { code: "LISTING_NOT_FOUND", message: "No listing found with ID 'listing_xyz_999'." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // RECENT SEARCHES & PERSONALISED SUGGESTIONS
        // ─────────────────────────────────────────

        "/customers/{customerId}/recent-searches": {
          get: {
            tags: ["Recent Searches"],
            summary: "Get a customer's recent search history",
            description: "Returns the last N searches made by the customer — location, dates, guest count, and filters used. Used to power the 'Recent searches' section on the home screen.",
            parameters: [
              { name: "customerId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 5 }, example: 5 }
            ],
            responses: {
              "200": {
                description: "Recent search history retrieved successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/RecentSearchesResponse" },
                    examples: {
                      recentSearches: {
                        summary: "Customer with 3 recent searches",
                        value: {
                          customerId: "cust001",
                          searches: [
                            { searchId: "srch_091", location: "New York, NY", checkIn: "2026-04-10", checkOut: "2026-04-14", adults: 2, children: 1, propertyType: "apartment", searchedAt: "2026-03-01T10:00:00Z" },
                            { searchId: "srch_088", location: "Tokyo, Japan", checkIn: "2026-06-01", checkOut: "2026-06-08", adults: 2, children: 0, propertyType: "any", searchedAt: "2026-02-27T14:30:00Z" },
                            { searchId: "srch_075", location: "Barcelona, Spain", checkIn: "2026-05-15", checkOut: "2026-05-20", adults: 2, children: 0, propertyType: "apartment", searchedAt: "2026-02-20T09:15:00Z" }
                          ]
                        }
                      },
                      emptyHistory: {
                        summary: "No search history for customer",
                        value: { customerId: "cust009", searches: [] }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — customer does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      customerNotFound: {
                        summary: "Customer not found",
                        value: { code: "CUSTOMER_NOT_FOUND", message: "No customer found with ID 'cust999'." }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            tags: ["Recent Searches"],
            summary: "Clear a customer's recent search history",
            description: "Deletes all saved recent searches for the customer.",
            parameters: [
              { name: "customerId", in: "path", required: true, schema: { type: "string" }, example: "cust001" }
            ],
            responses: {
              "200": {
                description: "Search history cleared successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ClearSearchesResponse" },
                    examples: {
                      cleared: {
                        summary: "History deleted",
                        value: { customerId: "cust001", deleted: 5, message: "Search history cleared successfully." }
                      },
                      alreadyEmpty: {
                        summary: "No history to clear",
                        value: { customerId: "cust001", deleted: 0, message: "No search history found to clear." }
                      }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorized — caller cannot clear another user's history",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      unauthorized: {
                        summary: "Not authenticated",
                        value: { code: "UNAUTHORIZED", message: "Authentication token is missing or has expired." }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — customer does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Customer not found",
                        value: { code: "CUSTOMER_NOT_FOUND", message: "No customer found with ID 'cust999'." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/customers/{customerId}/suggested-destinations": {
          get: {
            tags: ["Personalised Suggestions"],
            summary: "Get personalised destination suggestions for a customer",
            description: "Returns destination suggestions tailored to the customer based on their recent searches, saved wishlists, past bookings, and seasonal trends. Used to power the 'Inspired by your searches' section.",
            parameters: [
              { name: "customerId", in: "path", required: true, schema: { type: "string" }, example: "cust001" },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 6 }, example: 6 }
            ],
            responses: {
              "200": {
                description: "Personalised destination suggestions returned successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/SuggestedDestinationsResponse" },
                    examples: {
                      personalised: {
                        summary: "Suggestions based on recent activity",
                        value: {
                          customerId: "cust001",
                          basedOn: ["recent_searches", "past_bookings", "seasonal_trends"],
                          destinations: [
                            { destinationId: "dest_tokyo", name: "Tokyo", country: "Japan", thumbnail: "https://cdn.example.com/destinations/tokyo.jpg", avgPricePerNight: 95.00, currency: "USD", availableListings: 340, reason: "You recently searched Tokyo", tags: ["trending", "culture", "food"] },
                            { destinationId: "dest_barcelona", name: "Barcelona", country: "Spain", thumbnail: "https://cdn.example.com/destinations/barcelona.jpg", avgPricePerNight: 110.00, currency: "USD", availableListings: 275, reason: "Popular with guests who stayed in New York", tags: ["beach", "architecture", "nightlife"] },
                            { destinationId: "dest_bali", name: "Bali", country: "Indonesia", thumbnail: "https://cdn.example.com/destinations/bali.jpg", avgPricePerNight: 65.00, currency: "USD", availableListings: 510, reason: "Trending this season", tags: ["beach", "wellness", "nature"] }
                          ]
                        }
                      },
                      noHistory: {
                        summary: "New customer — fallback to trending",
                        value: {
                          customerId: "cust009",
                          basedOn: ["seasonal_trends"],
                          destinations: [
                            { destinationId: "dest_paris", name: "Paris", country: "France", thumbnail: "https://cdn.example.com/destinations/paris.jpg", avgPricePerNight: 180.00, currency: "USD", availableListings: 920, reason: "Trending worldwide", tags: ["romance", "culture", "food"] }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — customer does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Customer not found",
                        value: { code: "CUSTOMER_NOT_FOUND", message: "No customer found with ID 'cust999'." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ─────────────────────────────────────────
        // TRENDING & TOP DESTINATIONS
        // ─────────────────────────────────────────

        "/destinations/trending": {
          get: {
            tags: ["Top Destinations"],
            summary: "Get worldwide trending destinations",
            description: "Returns globally trending destinations ranked by search volume, booking activity, and social signals over the last 7 days. Used to power the 'Trending worldwide' section on the home screen.",
            parameters: [
              { name: "region", in: "query", required: false, schema: { type: "string", enum: ["worldwide", "asia", "europe", "americas", "africa", "oceania"] }, example: "worldwide", description: "Filter trending destinations by world region" },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, example: 10 }
            ],
            responses: {
              "200": {
                description: "Trending destinations retrieved successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/TrendingDestinationsResponse" },
                    examples: {
                      worldwide: {
                        summary: "Top 5 worldwide trending destinations",
                        value: {
                          region: "worldwide",
                          period: "last_7_days",
                          destinations: [
                            { rank: 1, destinationId: "dest_tokyo", name: "Tokyo", country: "Japan", searchVolumeDelta: "+34%", avgPricePerNight: 95.00, currency: "USD", availableListings: 340, thumbnail: "https://cdn.example.com/destinations/tokyo.jpg", tags: ["culture", "food", "city"] },
                            { rank: 2, destinationId: "dest_bali", name: "Bali", country: "Indonesia", searchVolumeDelta: "+28%", avgPricePerNight: 65.00, currency: "USD", availableListings: 510, thumbnail: "https://cdn.example.com/destinations/bali.jpg", tags: ["beach", "wellness", "nature"] },
                            { rank: 3, destinationId: "dest_paris", name: "Paris", country: "France", searchVolumeDelta: "+21%", avgPricePerNight: 180.00, currency: "USD", availableListings: 920, thumbnail: "https://cdn.example.com/destinations/paris.jpg", tags: ["romance", "culture", "food"] },
                            { rank: 4, destinationId: "dest_nyc", name: "New York", country: "USA", searchVolumeDelta: "+19%", avgPricePerNight: 145.00, currency: "USD", availableListings: 1240, thumbnail: "https://cdn.example.com/destinations/nyc.jpg", tags: ["city", "shopping", "nightlife"] },
                            { rank: 5, destinationId: "dest_santorini", name: "Santorini", country: "Greece", searchVolumeDelta: "+17%", avgPricePerNight: 220.00, currency: "USD", availableListings: 195, thumbnail: "https://cdn.example.com/destinations/santorini.jpg", tags: ["beach", "romance", "luxury"] }
                          ]
                        }
                      },
                      asia: {
                        summary: "Top trending in Asia",
                        value: {
                          region: "asia",
                          period: "last_7_days",
                          destinations: [
                            { rank: 1, destinationId: "dest_tokyo", name: "Tokyo", country: "Japan", searchVolumeDelta: "+34%", avgPricePerNight: 95.00, currency: "USD", availableListings: 340, thumbnail: "https://cdn.example.com/destinations/tokyo.jpg", tags: ["culture", "food", "city"] },
                            { rank: 2, destinationId: "dest_bali", name: "Bali", country: "Indonesia", searchVolumeDelta: "+28%", avgPricePerNight: 65.00, currency: "USD", availableListings: 510, thumbnail: "https://cdn.example.com/destinations/bali.jpg", tags: ["beach", "wellness"] },
                            { rank: 3, destinationId: "dest_bangkok", name: "Bangkok", country: "Thailand", searchVolumeDelta: "+15%", avgPricePerNight: 55.00, currency: "USD", availableListings: 680, thumbnail: "https://cdn.example.com/destinations/bangkok.jpg", tags: ["food", "temples", "nightlife"] }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad Request — invalid region value",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      invalidRegion: {
                        summary: "Unsupported region filter",
                        value: { code: "INVALID_PARAMETER", message: "Region 'middle_east' is not supported. Accepted values: worldwide, asia, europe, americas, africa, oceania." }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        "/destinations/{destinationId}/listings": {
          get: {
            tags: ["Top Destinations"],
            summary: "Get top-rated listings in a destination",
            description: "Returns the highest-rated and most-booked listings within a specific destination. Used when a user taps a destination card to browse its listings.",
            parameters: [
              { name: "destinationId", in: "path", required: true, schema: { type: "string" }, example: "dest_tokyo" },
              { name: "checkIn", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-06-01" },
              { name: "checkOut", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-06-08" },
              { name: "adults", in: "query", required: false, schema: { type: "integer", default: 2 }, example: 2 },
              { name: "propertyType", in: "query", required: false, schema: { type: "string", enum: ["any", "hotel", "apartment", "house", "villa", "cabin", "hostel"] }, example: "any" },
              { name: "limit", in: "query", required: false, schema: { type: "integer", default: 20 }, example: 20 }
            ],
            responses: {
              "200": {
                description: "Top listings in destination retrieved successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/SearchResultsResponse" },
                    examples: {
                      tokyoListings: {
                        summary: "Top listings in Tokyo",
                        value: {
                          query: { destinationId: "dest_tokyo", checkIn: "2026-06-01", checkOut: "2026-06-08", adults: 2 },
                          totalCount: 340,
                          page: 1,
                          limit: 20,
                          listings: [
                            {
                              listingId: "listing_tky_001",
                              title: "Modern Studio in Shinjuku",
                              propertyType: "apartment",
                              location: { city: "Tokyo", neighborhood: "Shinjuku", country: "JP", lat: 35.6938, lng: 139.7034 },
                              pricePerNight: 88.00,
                              currency: "USD",
                              totalPrice: 616.00,
                              rating: 4.91,
                              reviewCount: 318,
                              maxGuests: 2,
                              bedrooms: 1,
                              bathrooms: 1,
                              amenities: ["wifi", "kitchen", "air_conditioning"],
                              instantBook: true,
                              thumbnail: "https://cdn.example.com/listings/tky_001/thumb.jpg",
                              isSuperhost: true
                            },
                            {
                              listingId: "listing_tky_002",
                              title: "Traditional Machiya in Asakusa",
                              propertyType: "house",
                              location: { city: "Tokyo", neighborhood: "Asakusa", country: "JP", lat: 35.7148, lng: 139.7967 },
                              pricePerNight: 120.00,
                              currency: "USD",
                              totalPrice: 840.00,
                              rating: 4.96,
                              reviewCount: 147,
                              maxGuests: 4,
                              bedrooms: 2,
                              bathrooms: 1,
                              amenities: ["wifi", "kitchen", "washer"],
                              instantBook: false,
                              thumbnail: "https://cdn.example.com/listings/tky_002/thumb.jpg",
                              isSuperhost: true
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              "404": {
                description: "Not Found — destination ID does not exist",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      notFound: {
                        summary: "Destination not found",
                        value: { code: "DESTINATION_NOT_FOUND", message: "No destination found with ID 'dest_xyz999'." }
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

          ListingSummary: {
            type: "object",
            properties: {
              listingId: { type: "string", example: "listing_nyc_001" },
              title: { type: "string", example: "Cozy Manhattan Loft in Midtown" },
              propertyType: { type: "string", enum: ["hotel", "apartment", "house", "villa", "cabin", "hostel"], example: "apartment" },
              location: {
                type: "object",
                properties: {
                  city: { type: "string", example: "New York" },
                  neighborhood: { type: "string", example: "Midtown" },
                  country: { type: "string", example: "US" },
                  lat: { type: "number", example: 40.7549 },
                  lng: { type: "number", example: -73.9840 }
                }
              },
              pricePerNight: { type: "number", format: "float", example: 130.00 },
              currency: { type: "string", example: "USD" },
              totalPrice: { type: "number", format: "float", example: 520.00, nullable: true },
              rating: { type: "number", format: "float", example: 4.87 },
              reviewCount: { type: "integer", example: 214 },
              maxGuests: { type: "integer", example: 4 },
              bedrooms: { type: "integer", example: 1 },
              bathrooms: { type: "number", example: 1 },
              amenities: { type: "array", items: { type: "string" }, example: ["wifi", "kitchen", "washer"] },
              instantBook: { type: "boolean", example: true },
              thumbnail: { type: "string", example: "https://cdn.example.com/listings/nyc_001/thumb.jpg" },
              isSuperhost: { type: "boolean", example: true }
            }
          },

          SearchResultsResponse: {
            type: "object",
            properties: {
              query: { type: "object", example: { location: "New York, NY", checkIn: "2026-04-10", checkOut: "2026-04-14", adults: 2, propertyType: "apartment" } },
              totalCount: { type: "integer", example: 148 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              listings: { type: "array", items: { $ref: "#/components/schemas/ListingSummary" } }
            }
          },

          ListingDetail: {
            type: "object",
            properties: {
              listingId: { type: "string", example: "listing_nyc_001" },
              title: { type: "string", example: "Cozy Manhattan Loft in Midtown" },
              description: { type: "string", example: "A beautifully furnished loft in the heart of Midtown Manhattan." },
              propertyType: { type: "string", example: "apartment" },
              location: {
                type: "object",
                properties: {
                  address: { type: "string", example: "350 W 42nd St" },
                  city: { type: "string", example: "New York" },
                  neighborhood: { type: "string", example: "Midtown" },
                  state: { type: "string", example: "NY" },
                  country: { type: "string", example: "US" },
                  lat: { type: "number", example: 40.7549 },
                  lng: { type: "number", example: -73.9840 }
                }
              },
              host: {
                type: "object",
                properties: {
                  hostId: { type: "string", example: "host123" },
                  name: { type: "string", example: "John Host" },
                  isSuperhost: { type: "boolean", example: true },
                  rating: { type: "number", example: 4.95 },
                  responseRate: { type: "integer", example: 98 },
                  responseTime: { type: "string", example: "within an hour" },
                  memberSince: { type: "string", format: "date", example: "2019-06-01" }
                }
              },
              pricePerNight: { type: "number", format: "float", example: 130.00 },
              currency: { type: "string", example: "USD" },
              totalPrice: { type: "number", format: "float", example: 520.00 },
              pricingBreakdown: {
                type: "object",
                properties: {
                  basePrice: { type: "number", example: 520.00 },
                  cleaningFee: { type: "number", example: 45.00 },
                  serviceFee: { type: "number", example: 78.00 },
                  taxes: { type: "number", example: 52.00 },
                  grandTotal: { type: "number", example: 695.00 }
                }
              },
              rating: { type: "number", example: 4.87 },
              reviewCount: { type: "integer", example: 214 },
              maxGuests: { type: "integer", example: 4 },
              bedrooms: { type: "integer", example: 1 },
              beds: { type: "integer", example: 1 },
              bathrooms: { type: "number", example: 1 },
              amenities: { type: "array", items: { type: "string" }, example: ["wifi", "kitchen", "washer", "air_conditioning"] },
              photos: { type: "array", items: { type: "string" }, example: ["https://cdn.example.com/listings/nyc_001/photo1.jpg"] },
              houseRules: {
                type: "object",
                properties: {
                  checkInTime: { type: "string", example: "15:00" },
                  checkOutTime: { type: "string", example: "11:00" },
                  smokingAllowed: { type: "boolean", example: false },
                  petsAllowed: { type: "boolean", example: false },
                  partiesAllowed: { type: "boolean", example: false }
                }
              },
              cancellationPolicy: { type: "string", enum: ["flexible", "moderate", "strict"], example: "moderate" },
              instantBook: { type: "boolean", example: true },
              availabilityStatus: { type: "string", enum: ["available", "unavailable"], example: "available" }
            }
          },

          RecentSearch: {
            type: "object",
            properties: {
              searchId: { type: "string", example: "srch_091" },
              location: { type: "string", example: "New York, NY" },
              checkIn: { type: "string", format: "date", example: "2026-04-10", nullable: true },
              checkOut: { type: "string", format: "date", example: "2026-04-14", nullable: true },
              adults: { type: "integer", example: 2 },
              children: { type: "integer", example: 0 },
              propertyType: { type: "string", example: "apartment" },
              searchedAt: { type: "string", format: "date-time", example: "2026-03-01T10:00:00Z" }
            }
          },

          RecentSearchesResponse: {
            type: "object",
            properties: {
              customerId: { type: "string", example: "cust001" },
              searches: { type: "array", items: { $ref: "#/components/schemas/RecentSearch" } }
            }
          },

          ClearSearchesResponse: {
            type: "object",
            properties: {
              customerId: { type: "string", example: "cust001" },
              deleted: { type: "integer", example: 5 },
              message: { type: "string", example: "Search history cleared successfully" }
            }
          },

          DestinationSuggestion: {
            type: "object",
            properties: {
              destinationId: { type: "string", example: "dest_tokyo" },
              name: { type: "string", example: "Tokyo" },
              country: { type: "string", example: "Japan" },
              thumbnail: { type: "string", example: "https://cdn.example.com/destinations/tokyo.jpg" },
              avgPricePerNight: { type: "number", format: "float", example: 95.00 },
              currency: { type: "string", example: "USD" },
              availableListings: { type: "integer", example: 340 },
              reason: { type: "string", example: "You recently searched Tokyo" },
              tags: { type: "array", items: { type: "string" }, example: ["trending", "culture", "food"] }
            }
          },

          SuggestedDestinationsResponse: {
            type: "object",
            properties: {
              customerId: { type: "string", example: "cust001" },
              basedOn: { type: "array", items: { type: "string" }, example: ["recent_searches", "past_bookings", "seasonal_trends"] },
              destinations: { type: "array", items: { $ref: "#/components/schemas/DestinationSuggestion" } }
            }
          },

          TrendingDestination: {
            type: "object",
            properties: {
              rank: { type: "integer", example: 1 },
              destinationId: { type: "string", example: "dest_tokyo" },
              name: { type: "string", example: "Tokyo" },
              country: { type: "string", example: "Japan" },
              searchVolumeDelta: { type: "string", example: "+34%" },
              avgPricePerNight: { type: "number", format: "float", example: 95.00 },
              currency: { type: "string", example: "USD" },
              availableListings: { type: "integer", example: 340 },
              thumbnail: { type: "string", example: "https://cdn.example.com/destinations/tokyo.jpg" },
              tags: { type: "array", items: { type: "string" }, example: ["culture", "food", "city"] }
            }
          },

          TrendingDestinationsResponse: {
            type: "object",
            properties: {
              region: { type: "string", example: "worldwide" },
              period: { type: "string", example: "last_7_days" },
              destinations: { type: "array", items: { $ref: "#/components/schemas/TrendingDestination" } }
            }
          },

          ErrorResponse: {
            type: "object",
            properties: {
              code: { type: "string", example: "LISTING_NOT_FOUND" },
              message: { type: "string", example: "No listing found with ID listing_xyz_999" }
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
