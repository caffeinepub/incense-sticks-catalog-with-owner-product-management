import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldProduct = {
    id : Nat;
    name : Text;
    price : Nat; // Old price (assumed already in paise, but originally caused UI issues)
    description : Text;
    scent : Text;
    inStock : Bool;
    photoUrl : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, OldProduct>;
  };

  type NewProduct = OldProduct;
  type NewActor = {
    products : Map.Map<Nat, NewProduct>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
