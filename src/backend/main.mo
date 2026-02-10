import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type Product = {
    id : Nat;
    name : Text;
    price : Nat; // Price is now in paise (minor units)
    description : Text;
    scent : Text;
    inStock : Bool;
    photoUrl : Text;
  };

  public type OrderRequest = {
    id : Nat;
    products : [(Product, Nat)];
    customerName : Text;
    contactDetails : Text;
    note : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Nat, Product>();
  let orderRequests = Map.empty<Nat, OrderRequest>();

  var nextProductId = 4;
  var nextOrderRequestId = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin-only)
  public shared ({ caller }) func createProduct(name : Text, price : Nat, description : Text, scent : Text, photoUrl : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let product : Product = {
      id = productId;
      name;
      price; // Store price directly in paise (minor units)
      description;
      scent;
      inStock = true;
      photoUrl;
    };

    products.add(productId, product);
    productId;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, name : Text, price : Nat, description : Text, scent : Text, photoUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    let existingProduct = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    let updatedProduct : Product = {
      id = existingProduct.id;
      name;
      price; // Store price directly in paise (minor units)
      description;
      scent;
      inStock = existingProduct.inStock;
      photoUrl;
    };

    products.add(productId, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    products.remove(productId);
  };

  public shared ({ caller }) func toggleProductStock(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle product stock");
    };

    let existingProduct = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    let updatedProduct = {
      existingProduct with inStock = not existingProduct.inStock;
    };

    products.add(productId, updatedProduct);
  };

  // Product Browsing (Public - no authentication required)
  public query func getAllProducts() : async [Product] {
    products.toArray().map(func((_, p)) { p });
  };

  public query func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  public query func getInStockProducts() : async [Product] {
    products.toArray().map(func((_, p)) { p }).filter(func(p) { p.inStock });
  };

  // Order Submission (Public - allows anonymous orders)
  public shared func submitOrderRequest(productsWithQuantity : [(Product, Nat)], customerName : Text, contactDetails : Text, note : ?Text) : async Nat {
    let orderId = nextOrderRequestId;
    nextOrderRequestId += 1;

    let orderRequest : OrderRequest = {
      id = orderId;
      products = productsWithQuantity;
      customerName;
      contactDetails;
      note;
    };

    orderRequests.add(orderId, orderRequest);
    orderId;
  };

  // Order Management (Admin-only)
  public query ({ caller }) func getAllOrderRequests() : async [OrderRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view order requests");
    };
    orderRequests.toArray().map(func((_, o)) { o });
  };

  public query ({ caller }) func getOrderRequest(orderId : Nat) : async ?OrderRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access order requests");
    };
    orderRequests.get(orderId);
  };

  public shared ({ caller }) func deleteOrderRequest(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete order requests");
    };

    if (not orderRequests.containsKey(orderId)) {
      Runtime.trap("Order request not found");
    };
    orderRequests.remove(orderId);
  };
};
