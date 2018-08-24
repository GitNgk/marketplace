## Race Conditions

### Reentrancy
The Use of `send()` has been employed in application and a state machine implementation used within contract. All state changes happen prior to transfers to stop withdrawals:
```
       require(order.state != State.Refund,"Check REFUND" );
       order.state = State.Complete;
       manager.transfer(order.price);
and
       if(order.buyer == _winner ){
           order.state = State.Complete;
           order.buyer.transfer(order.price);
       } else if (manager == _winner ) {
           order.state = State.Complete;
           manager.transfer(order.price);
       }
```

### Cross-function Race Conditions
This case has been avoided as no external function calls are made during withdrawal of tokens. Also by maintaining state information of each order provides second layer to defence.

### Pitfalls in Race Condition Solutions

## Transaction-Ordering Dependence (TOD) / Front Running

### Timestamp Dependence
Avoided as the Store can tolerate 30-second drift in time and `block.timestamp` used over `now`.

###Integer Overflow and Underflow & Underflow in Depth: Storage Manipulation
Uint values changes for Inventory are controlled by admin staff. Also any purchases are restricted using modifier to first check the quantity falls within inventory amount set by Store manager and mathematical operations are done using SafeMath libary:
```
modifier forSale (uint _sku,uint _quantity) { require(items[_sku].inventory >= _quantity,"Check AVAILIBILTY" ); _;}
```
In addition to this the SafeMath.sol library has been used when doing uint operations.

### TX.ORIGIN PROBLEM
- Used msg.sender rather than tx.origin

### GAS LIMITS
- No for loops used in any of the contracts.
- Limit the length of description string 
