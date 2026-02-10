import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";

module {
  // Old types (before adding deliveryAddress and shippingFee)
  type OldProduct = {
    id : Nat;
    name : Text;
    price : Nat;
    description : Text;
    scent : Text;
    inStock : Bool;
    photoUrl : Text;
  };

  type OldOrderRequest = {
    id : Nat;
    products : [(OldProduct, Nat)];
    customerName : Text;
    contactDetails : Text;
    note : ?Text;
    paymentMethod : {
      #cod;
      #upi : {
        reference : ?Text;
        transactionId : ?Text;
      };
    };
  };

  type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    orderRequests : Map.Map<Nat, OldOrderRequest>;
    nextProductId : Nat;
    nextOrderRequestId : Nat;
  };

  // New types
  type NewProduct = OldProduct;

  type Address = {
    firstLine : Text;
    landmark : Text;
    city : Text;
    pinCode : Text;
  };

  type NewOrderRequest = {
    id : Nat;
    products : [(NewProduct, Nat)];
    customerName : Text;
    contactDetails : Text;
    note : ?Text;
    deliveryAddress : Address;
    shippingFee : Nat;
    paymentMethod : {
      #cod;
      #upi : {
        reference : ?Text;
        transactionId : ?Text;
      };
    };
  };

  type NewActor = {
    products : Map.Map<Nat, NewProduct>;
    orderRequests : Map.Map<Nat, NewOrderRequest>;
    nextProductId : Nat;
    nextOrderRequestId : Nat;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    let newOrderRequests = old.orderRequests.map<Nat, OldOrderRequest, NewOrderRequest>(
      func(_id, oldOrder) {
        {
          oldOrder with
          deliveryAddress = {
            firstLine = "Unknown";
            landmark = "Unknown";
            city = "Unknown";
            pinCode = "Unknown";
          };
          shippingFee = 0;
        };
      }
    );

    {
      old with
      orderRequests = newOrderRequests;
    };
  };
};
