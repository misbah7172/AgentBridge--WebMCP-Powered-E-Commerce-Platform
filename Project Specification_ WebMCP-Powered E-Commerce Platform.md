# Project Specification: WebMCP-Powered E-Commerce Platform

## 1. Project Objective

Build a complete, production-quality, fully functional e-commerce web application that demonstrates the practical capabilities of WebMCP.

The application must be a genuine e-commerce website that a human can use through a conventional web interface and that an AI agent can operate through explicitly registered WebMCP tools.

The project must not be designed primarily as a WebMCP dashboard, developer console, tool-management interface, or AI-agent control panel.

The primary interface must look and behave like a modern e-commerce website.

WebMCP should be integrated naturally into the website so that an AI agent can discover and execute meaningful actions on behalf of the user.

The application must contain at least 10-15 meaningful e-commerce functionalities, and every functionality exposed to AI agents must have a corresponding WebMCP tool using:

```javascript
document.modelContext.registerTool(...)
```

The final result must be fully functional, visually polished, responsive, and suitable for demonstrating the WebMCP capabilities in a hackathon.

---

# 2. Core Concept

The application should support two interaction modes:

### Human interaction

A user can normally interact with the website using:

- navigation
- search
- product cards
- filters
- product pages
- cart
- wishlist
- checkout
- account
- orders
- etc.

### AI-agent interaction

An AI agent operating through WebMCP can discover the tools exposed by the current website and execute those operations.

The architecture should conceptually work as:

```text
                 Human User
                     |
                     v
              E-Commerce UI
                     |
                     |
              WebMCP Tool Layer
                     |
                     v
       document.modelContext.registerTool()
                     |
                     v
                AI Agent
                     |
                     v
                   LLM
```

The website should expose semantic actions rather than forcing the AI agent to simulate every UI interaction through clicks and keyboard input.

For example:

```text
search_products
get_product_details
filter_products
add_to_cart
remove_from_cart
update_cart_quantity
get_cart
add_to_wishlist
remove_from_wishlist
get_order_history
get_order_details
create_order
cancel_order
update_shipping_address
get_recommendations
```

---

# 3. Important WebMCP Requirement

Do not create fake WebMCP tools whose implementations merely return hard-coded text.

Every registered tool must connect to real application functionality.

For example, this is acceptable:

```javascript
document.modelContext.registerTool({
    name: "search_products",
    description: "Search the product catalog using a product name or keyword.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Product name, keyword, or search phrase."
            }
        },
        required: ["query"]
    },
    execute: async ({ query }) => {
        return await searchProducts(query);
    }
});
```

The `searchProducts()` function must actually search the application's product database/API.

Do not create tools that only demonstrate that `registerTool()` exists.

---

# 4. E-Commerce Application

Create a complete e-commerce store.

Use a realistic product catalog with enough products to make searching, filtering, sorting, recommendations, cart management, and other tools meaningful.

The store should include multiple categories such as:

- Electronics
- Laptops
- Smartphones
- Computer Accessories
- Gaming
- Headphones
- Monitors
- Cameras
- Smart Devices

Create realistic product information including:

```text
id
name
description
category
brand
price
discount
rating
reviewCount
stock
images
specifications
tags
```

Use seeded database data rather than relying entirely on static frontend arrays.

---

# 5. Required WebMCP Tools

Implement at least 15 meaningful tools.

Preferably implement the following tools.

## Tool 1: Search Products

Tool name:

```text
search_products
```

Purpose:

Search the product catalog.

Example:

```text
"Find RTX 3050 laptops"
```

Input:

```json
{
  "query": "RTX 3050 laptop"
}
```

The tool should return matching products with useful information such as:

- product ID
- name
- price
- rating
- stock status
- relevant specifications

---

## Tool 2: Get Product Details

Tool name:

```text
get_product_details
```

Purpose:

Retrieve complete information about a specific product.

Input:

```json
{
  "productId": "..."
}
```

Return:

- description
- price
- specifications
- rating
- stock
- available variants
- discount
- images if appropriate

---

## Tool 3: Filter Products

Tool name:

```text
filter_products
```

Allow filtering by:

- category
- brand
- minimum price
- maximum price
- minimum rating
- availability

Example:

```json
{
  "category": "Laptop",
  "minPrice": 500,
  "maxPrice": 1000,
  "minRating": 4
}
```

---

## Tool 4: Sort Products

Tool name:

```text
sort_products
```

Support:

- price ascending
- price descending
- rating
- popularity
- newest
- discount

---

## Tool 5: Add Product to Cart

Tool name:

```text
add_to_cart
```

This should require authentication.

Input:

```json
{
  "productId": "...",
  "quantity": 1
}
```

If the user is not authenticated, the tool must not perform the operation.

Instead, return a structured response indicating that authentication is required.

---

## Tool 6: Get Cart

Tool name:

```text
get_cart
```

Require authentication.

Return:

- products
- quantities
- individual prices
- discounts
- subtotal
- shipping
- estimated total

---

## Tool 7: Update Cart Quantity

Tool name:

```text
update_cart_quantity
```

Require authentication.

Input:

```json
{
  "productId": "...",
  "quantity": 3
}
```

---

## Tool 8: Remove Product From Cart

Tool name:

```text
remove_from_cart
```

Require authentication.

Input:

```json
{
  "productId": "..."
}
```

---

## Tool 9: Add to Wishlist

Tool name:

```text
add_to_wishlist
```

Require authentication.

Input:

```json
{
  "productId": "..."
}
```

---

## Tool 10: Remove From Wishlist

Tool name:

```text
remove_from_wishlist
```

Require authentication.

---

## Tool 11: Get Wishlist

Tool name:

```text
get_wishlist
```

Require authentication.

Return the user's current wishlist.

---

## Tool 12: Get Order History

Tool name:

```text
get_order_history
```

Require authentication.

Return the user's previous orders.

Do not expose another user's orders.

---

## Tool 13: Get Order Details

Tool name:

```text
get_order_details
```

Require authentication.

Input:

```json
{
  "orderId": "..."
}
```

The server must verify that the authenticated user owns the order.

---

## Tool 14: Cancel Order

Tool name:

```text
cancel_order
```

Require authentication.

Input:

```json
{
  "orderId": "..."
}
```

The application must verify that the order is eligible for cancellation.

Do not allow cancellation of orders that have already been shipped or delivered.

---

## Tool 15: Get Product Recommendations

Tool name:

```text
get_product_recommendations
```

This tool may be available without authentication or optionally provide personalized recommendations when authenticated.

It should return meaningful product recommendations based on:

- category
- product ID
- price range
- user preferences when authenticated

---

# 6. Optional Additional Tools

If practical, implement additional tools to make the demonstration stronger.

Examples:

```text
compare_products
check_product_stock
get_current_promotions
get_shipping_estimate
get_available_product_variants
update_shipping_address
get_saved_addresses
create_order
apply_coupon
calculate_cart_total
```

Aim for approximately 15-20 high-quality tools if implementation time permits.

Do not create unnecessary tools simply to increase the count.

Every tool must correspond to a real application capability.

---

# 7. Authentication-Aware WebMCP Tools

Authentication handling is one of the most important requirements.

Some tools must be public.

For example:

```text
search_products
get_product_details
filter_products
sort_products
get_product_recommendations
```

Other tools must require authentication.

For example:

```text
add_to_cart
get_cart
update_cart_quantity
remove_from_cart
add_to_wishlist
remove_from_wishlist
get_wishlist
get_order_history
get_order_details
cancel_order
```

---

# 8. Tool Visibility and Authentication UI

Do NOT create a large WebMCP dashboard.

Do NOT create a permanent sidebar showing WebMCP tools.

Do NOT make WebMCP the dominant element of the user interface.

Instead, create a very small, subtle WebMCP indicator in the bottom-right corner of the website.

Example:

```text
                                     
                                     
                               ↗
                              [ ]
```

Use a small arrow/tool indicator.

When the user moves the mouse cursor over the indicator, a compact floating panel should expand.

For example:

```text
                              ┌───────────────────────────────┐
                              │ WebMCP Tools                  │
                              │                               │
                              │ Search Products          ON   │
                              │ Product Details          ON   │
                              │ Filter Products          ON   │
                              │ Add to Cart             LOGIN │
                              │ Get Cart                LOGIN │
                              │ Wishlist                LOGIN │
                              │ Order History           LOGIN │
                              │ Cancel Order            LOGIN │
                              └───────────────────────────────┘
                                             ↑
                                           [→]
```

The visual design should remain minimal and professional.

---

# 9. Tool Indicator Behavior

The bottom-right WebMCP indicator should behave dynamically.

### If the website has no registered tools

Do not show an expanded tool list.

The indicator can either:

- remain hidden, or
- display a minimal inactive state.

Prefer hiding it when there are no registered WebMCP tools.

### If the website has registered tools

Show the small indicator.

When hovered:

```text
small arrow
     ↓
tool list expands
```

When the cursor leaves:

```text
tool list collapses
```

Use a smooth but subtle transition.

Do not create an intrusive modal.

---

# 10. Tool List States

The tool list must distinguish between:

### Available tools

Example:

```text
Search Products              Available
Get Product Details           Available
Filter Products               Available
```

### Authentication-required tools while logged out

Example:

```text
Add to Cart                   Login required
Get Cart                      Login required
Wishlist                      Login required
Order History                 Login required
Cancel Order                  Login required
```

These tools should remain visible in the tool list, but visually disabled.

They must not disappear simply because the user is logged out.

This allows the user and agent to understand that the capability exists but requires authentication.

---

# 11. Dynamic Authentication State

After the user logs in:

```text
Logged out
    |
    v
Authentication
    |
    v
Logged in
    |
    v
WebMCP tool state updates
```

Previously disabled tools should automatically become enabled.

For example:

Before login:

```text
Add to Cart             Disabled
Get Cart                Disabled
Wishlist                Disabled
Order History           Disabled
```

After login:

```text
Add to Cart             Available
Get Cart                Available
Wishlist                Available
Order History           Available
```

Do not require a page refresh if possible.

The WebMCP tool registry/UI should react to authentication state changes.

---

# 12. Agent Calling an Authentication-Protected Tool

When an AI agent attempts to use an authentication-protected tool while the user is logged out, the tool must not silently fail.

For example:

Agent calls:

```text
add_to_cart({
    productId: "123",
    quantity: 1
})
```

The tool should return a structured result indicating:

```json
{
  "success": false,
  "requiresAuthentication": true,
  "message": "Authentication is required to add products to the cart."
}
```

The AI agent should then be able to communicate naturally:

```text
You need to log in before I can add this product to your cart.
```

The website should not automatically collect or expose passwords to the AI agent.

Authentication must remain a normal user-controlled website interaction.

---

# 13. After Login

After the user logs in, the agent should be able to retry the operation.

Example:

```text
User:
Add this laptop to my cart.

Agent:
Authentication is required.

Website:
User logs in.

Agent:
Retrying add_to_cart...

WebMCP:
add_to_cart(...)

Website:
Product added successfully.
```

Return meaningful success information.

Example:

```json
{
  "success": true,
  "productId": "123",
  "quantity": 1,
  "cartItemCount": 3,
  "cartTotal": 749.00
}
```

---

# 14. Security Requirements

Never expose:

- passwords
- authentication tokens
- session secrets
- payment card information
- private database credentials

through WebMCP tool responses.

Authentication should be managed by the normal web application's authentication system.

WebMCP tools must verify the authenticated session on the server whenever a protected operation accesses private data.

Never trust a product ID, user ID, order ID, or other identifier supplied by the client without authorization checks.

For example:

```text
get_order_details(orderId)
```

must verify:

```text
order.userId === authenticatedUser.id
```

before returning the order.

---

# 15. Checkout and Payment Safety

If implementing checkout, do not implement real payment processing unless necessary.

Use a safe demonstration checkout flow.

For example:

```text
Cart
 ↓
Shipping Information
 ↓
Order Review
 ↓
Demo Payment
 ↓
Order Created
```

Clearly label any payment implementation as a demo/test environment.

Do not collect real credit-card information.

If a `create_order` WebMCP tool is implemented, require authentication and appropriate confirmation before creating an order.

---

# 16. Normal Website UI

The website should look like a real modern e-commerce platform.

Include:

### Header

- brand/logo
- search bar
- categories
- account/login
- wishlist
- cart

### Homepage

Include:

- hero section
- featured products
- categories
- promotional products
- popular products
- recommended products

### Product listing page

Include:

- product grid
- search
- filters
- sorting
- pagination or infinite scrolling

### Product detail page

Include:

- product images
- name
- price
- discount
- rating
- description
- specifications
- stock status
- quantity selector
- add to cart
- wishlist

### Cart page

Include:

- products
- quantities
- remove
- subtotal
- shipping
- total
- checkout

### Account

Include:

- profile
- orders
- wishlist
- saved addresses

---

# 17. Visual Design

The entire application must have a professional, modern, minimal appearance.

Requirements:

- no emojis
- no playful cartoon UI
- no excessive gradients
- no unnecessary animations
- no oversized WebMCP branding
- no developer-oriented dashboard
- no technical clutter

Use a consistent design system.

The UI should look like a legitimate commercial e-commerce application.

WebMCP should feel like an integrated platform capability rather than the entire product.

---

# 18. Recommended Architecture

Use a clean full-stack architecture.

Example:

```text
Frontend
React / Next.js
        |
        v
Application API
        |
        ├── Authentication
        ├── Product Service
        ├── Cart Service
        ├── Wishlist Service
        ├── Order Service
        └── Recommendation Service
        |
        v
Database
```

WebMCP:

```text
Frontend
   |
   v
WebMCP Tool Registry
   |
   ├── search_products
   ├── get_product_details
   ├── filter_products
   ├── add_to_cart
   ├── get_cart
   ├── wishlist tools
   ├── order tools
   └── recommendation tools
   |
   v
Application API
```

Do not duplicate business logic inside every WebMCP tool.

Prefer:

```text
WebMCP Tool
     |
     v
Application Service
     |
     v
API / Database
```

This ensures that human UI actions and AI actions use the same business logic.

---

# 19. WebMCP Tool Registry

Create a centralized WebMCP registration module.

For example:

```text
src/
  webmcp/
    registry.ts
    productTools.ts
    cartTools.ts
    wishlistTools.ts
    orderTools.ts
    recommendationTools.ts
```

The registry should:

1. register tools when WebMCP is available
2. detect authentication state
3. register appropriate tool metadata
4. handle protected operations
5. return structured tool results
6. update tool state when authentication changes

Do not assume that every browser supports WebMCP.

Implement graceful fallback behavior.

The normal website must remain completely functional even when WebMCP is unavailable.

---

# 20. WebMCP Feature Detection

Before using the API, safely check whether it is available.

Conceptually:

```javascript
if ("modelContext" in document) {
    // Register WebMCP tools
}
```

Do not cause the website to crash in browsers without WebMCP support.

The e-commerce application must work normally without WebMCP.

---

# 21. Tool Metadata

Every tool must have high-quality metadata.

Avoid vague descriptions such as:

```text
"Does product stuff"
```

Use descriptions that allow an AI model to understand when and how the tool should be used.

Example:

```javascript
{
    name: "search_products",
    description:
      "Search the store's product catalog by keyword, product name, brand, or category.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description:
                  "A product name, keyword, brand, or category to search for."
            }
        },
        required: ["query"]
    }
}
```

Tool schemas must accurately represent the accepted inputs.

---

# 22. Structured Tool Results

Tools should return machine-readable structured results whenever appropriate.

Example:

```json
{
  "success": true,
  "products": [
    {
      "id": "p101",
      "name": "Gaming Laptop",
      "price": 799,
      "stock": 12,
      "rating": 4.6
    }
  ]
}
```

For errors:

```json
{
  "success": false,
  "error": "AUTHENTICATION_REQUIRED",
  "requiresAuthentication": true,
  "message": "Please log in to continue."
}
```

Use consistent result structures across the application.

---

# 23. Tool Permission Model

Categorize tools into:

### Public

```text
search_products
get_product_details
filter_products
sort_products
get_product_recommendations
```

### Authenticated

```text
add_to_cart
get_cart
update_cart_quantity
remove_from_cart
add_to_wishlist
remove_from_wishlist
get_wishlist
get_order_history
get_order_details
cancel_order
```

### Sensitive/Transactional

If implementing:

```text
create_order
apply_coupon
update_shipping_address
```

These should have stronger validation and, where appropriate, require explicit user confirmation.

Do not allow an AI agent to perform destructive or irreversible operations without appropriate safeguards.

---

# 24. Testing

Create comprehensive tests for both the website and WebMCP.

Test:

### Tool discovery

Verify that:

```text
document.modelContext
```

exists when WebMCP is supported and that expected tools are registered.

### Tool execution

Test every tool independently.

### Authentication

Test:

```text
logged out → protected tool
```

Expected:

```text
authentication required
```

Then:

```text
login → same tool
```

Expected:

```text
successful execution
```

### Authorization

Verify that a user cannot access another user's:

- cart
- wishlist
- orders
- addresses

through WebMCP.

### Invalid inputs

Test malformed inputs.

### Product availability

Test:

- out-of-stock products
- invalid product IDs
- invalid quantities

### Order states

Test cancellation restrictions.

---

# 25. Demo Scenarios

Create realistic scenarios demonstrating why WebMCP is useful.

At minimum, support these demonstrations.

## Scenario 1: Product Search

User:

```text
Find me a gaming laptop under $1000 with at least a 4-star rating.
```

Agent:

```text
search_products
filter_products
```

---

## Scenario 2: Product Details

User:

```text
Tell me the specifications and price of this laptop.
```

Agent:

```text
get_product_details
```

---

## Scenario 3: Add to Cart While Logged In

User:

```text
Add this laptop to my cart.
```

Agent:

```text
add_to_cart
```

Result:

```text
Product successfully added.
```

---

## Scenario 4: Authentication Required

User is logged out.

User:

```text
Add this laptop to my cart.
```

Agent:

```text
add_to_cart
```

Tool:

```text
AUTHENTICATION_REQUIRED
```

Agent:

```text
Please log in before I can add this product to your cart.
```

User logs in.

Agent retries.

```text
add_to_cart
```

Result:

```text
Product successfully added.
```

---

## Scenario 5: Cart Management

User:

```text
Show me my cart and increase the laptop quantity to two.
```

Agent:

```text
get_cart
update_cart_quantity
```

---

## Scenario 6: Wishlist

User:

```text
Add this monitor to my wishlist.
```

Agent:

```text
add_to_wishlist
```

---

## Scenario 7: Order History

User:

```text
Show me my recent orders.
```

Agent:

```text
get_order_history
```

---

## Scenario 8: Order Cancellation

User:

```text
Cancel my latest eligible order.
```

Agent:

```text
get_order_history
get_order_details
cancel_order
```

The application must validate whether cancellation is allowed.

---

# 26. WebMCP Tool Indicator

Implement the bottom-right indicator as a dedicated component.

Example:

```text
components/
    WebMCPIndicator/
        WebMCPIndicator.tsx
        ToolList.tsx
        ToolStatus.tsx
```

Behavior:

```text
No WebMCP tools
        ↓
Indicator hidden

WebMCP tools available
        ↓
Small arrow visible

Mouse hover
        ↓
Tool list expands

Mouse leaves
        ↓
Tool list collapses
```

Do not create a permanent sidebar.

Do not create a full WebMCP settings page unless absolutely necessary.

---

# 27. Tool List Example

The expanded list can look like:

```text
WebMCP

Search Products              Available
Product Details              Available
Filter Products              Available
Sort Products                Available
Product Recommendations      Available

Add to Cart                  Login required
View Cart                    Login required
Update Cart                  Login required
Wishlist                     Login required
Order History                Login required
Order Details                Login required
Cancel Order                 Login required
```

After login:

```text
WebMCP

Search Products              Available
Product Details              Available
Filter Products              Available
Sort Products                Available
Product Recommendations      Available

Add to Cart                  Available
View Cart                    Available
Update Cart                  Available
Wishlist                     Available
Order History                Available
Order Details                Available
Cancel Order                 Available
```

Keep the visual presentation compact.

---

# 28. Important UX Principle

The AI integration should be invisible during normal browsing.

A user should be able to visit the website and think:

> "This is a normal e-commerce website."

Only when they interact with the small WebMCP indicator should they discover:

> "This website exposes capabilities that an AI agent can use."

This should demonstrate the concept of an agent-accessible web without turning the website into an AI dashboard.

---

# 29. Database

Use a real database.

At minimum create tables/models for:

```text
users
products
categories
cart_items
wishlists
wishlist_items
orders
order_items
addresses
reviews
```

Seed the database with realistic data.

Do not depend on external APIs for core functionality.

The project should be runnable locally.

---

# 30. Authentication

Implement normal web authentication.

Support:

```text
Register
Login
Logout
Session management
Protected routes
```

Use secure password hashing and secure session handling.

Never expose credentials through WebMCP.

The WebMCP layer should use the existing authenticated browser session.

---

# 31. Project Documentation

Create a comprehensive README.

The README must explain:

1. Project purpose
2. Architecture
3. Technology stack
4. Installation
5. Environment variables
6. Database setup
7. Authentication
8. WebMCP implementation
9. Complete list of WebMCP tools
10. Tool schemas
11. Authentication behavior
12. Demo scenarios
13. Browser/WebMCP requirements
14. Testing
15. Deployment instructions

Include an architecture diagram using Mermaid if appropriate.

Example:

```text
Human
  |
  v
E-Commerce UI
  |
  +----------------------+
  |                      |
  v                      v
WebMCP Tool Layer     Normal API
  |                      |
  +----------+-----------+
             |
             v
       Application Services
             |
             v
          Database
```

---

# 32. Developer Requirements

Before writing code:

1. Inspect the project structure.
2. Select an appropriate technology stack if one has not already been specified.
3. Design the architecture.
4. Define the database schema.
5. Define the WebMCP tools.
6. Implement the core e-commerce functionality.
7. Implement authentication.
8. Implement WebMCP.
9. Implement the WebMCP indicator.
10. Implement tests.
11. Run the application.
12. Test every WebMCP tool.
13. Fix all runtime errors.
14. Verify that the normal website works without WebMCP.
15. Verify authenticated and unauthenticated WebMCP behavior.
16. Prepare deployment configuration.
17. Update README.

Do not stop after creating UI mockups.

The application must actually work.

---

# 33. Quality Requirements

The final application must satisfy all of the following:

- Real working e-commerce functionality
- Real database
- Real authentication
- At least 15 WebMCP tools
- Explicit `document.modelContext.registerTool()` usage
- Meaningful tool descriptions
- Correct JSON schemas
- Real tool execution
- Authentication-aware tools
- Disabled authentication-required tools shown in tool list
- Login state dynamically enables protected tools
- Unauthenticated tool invocation returns a login-required response
- Proper authorization checks
- No exposure of sensitive credentials
- Responsive design
- Professional visual design
- No emojis
- No unnecessary WebMCP dashboard
- Small bottom-right WebMCP indicator
- Hover/interaction reveals tool list
- Normal website remains usable without WebMCP
- Comprehensive README
- Tests for WebMCP functionality
- Local development setup
- Deployment-ready configuration

---

# 34. Most Important Design Principle

Do not build a "WebMCP demo disguised as an e-commerce website."

Build a **real e-commerce website whose capabilities are exposed through WebMCP**.

The e-commerce application is the product.

WebMCP is the agent-accessibility layer.

The AI agent should be able to interact with the same underlying functionality that human users interact with through the website.

The final architecture should therefore follow:

```text
                       USER
                         |
              +----------+----------+
              |                     |
              v                     v
        Human UI                AI Agent
              |                     |
              |                     v
              |                  WebMCP
              |                     |
              +----------+----------+
                         |
                         v
                 Application Logic
                         |
              +----------+----------+
              |          |          |
              v          v          v
           Products    Cart       Orders
              |          |          |
              +----------+----------+
                         |
                         v
                      Database
```

The key demonstration is:

**One real website, two interaction methods: humans through the UI and AI agents through WebMCP.**

Build the application completely rather than stopping at a prototype or static mockup.