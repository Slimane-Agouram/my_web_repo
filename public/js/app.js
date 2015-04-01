'use strict';

angular.module('App', ['ngMaterial', 'ui.router', 'ngResource'])

.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'public/views/partials/home.html',
      controller: 'HomeController',
    })
    .state('cart', {
      url: '/cart',
      templateUrl: 'public/views/partials/cart.html',
      controller: 'PanierController',
    })
    .state('checkout', {
      url: '/checkout',
      templateUrl: 'public/views/partials/checkout.html',
      controller: 'CheckoutController',
    })
    ;

})

// CONTROLLERS SECTION///////////////////////////////////////////////////////////////////////////


.controller('ItemListController', function($scope, ItemService, CategoryService, SearchService, hide_ShowService){
  $scope.$watch(CategoryService.getFilter, function(oldValue, newValue){
      $scope.items = ItemService.query();
  });

  $scope.$watch(SearchService.getSearch, function(oldValue, newValue){
      $scope.items = ItemService.query();
  });
  $scope.hide_option=hide_ShowService.getHide_ShowStatus();
  $scope.$watch(hide_ShowService.getHide_ShowStatus,function(oldValue, newValue){
    $scope.hide_option=hide_ShowService.getHide_ShowStatus();
  });
  $scope.sorts = [
    'price',
    'name',
    'description'
  ];
  $scope.sortCriteria = $scope.sorts[0];
  $scope.sortReverse = false;

})

.controller('HomeController', function($scope, $anchorScroll, $location, ArianeService, PanierController, ToastService, sharedProperties,hide_ShowService){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('VULPUTATE ADIPISCING', '');

  $scope.optionsHidden = false;

  $scope.toggleHideOptions = function(hideStatus){
    if(hideStatus=='Hide Option')
    {
      hide_ShowService.setHide_ShowStatus('Show Option');
    }
    else
    {
      hide_ShowService.setHide_ShowStatus('Hide Option');
    }
    $scope.optionsHidden = !$scope.optionsHidden;

    if(hide_ShowService.getHide_ShowStatus() == 'Hide Option')
    {
      hide_ShowService.setHide_ShowStatus('Hide Option');
    }
    else
    {
      hide_ShowService.setHide_ShowStatus('Show Option');
    }
  };

  $scope.addToCart = function(item){
    sharedProperties.setLatestProductName(item.name);
    PanierController.add(item);
    ToastService.simpleToast('"' + item.name + '"' + ' was added to your cart.');

  };

  $scope.QuickAdd = function(item){
    $scope.addToCart(item);
    $location.path("cart");
  };


})

.controller('CheckoutController', function($scope, ArianeService, UserService, ToastService){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Checkout', '/checkout');

  $scope.email = '';
  $scope.password = '';
  $scope.login = function(){
    var res = UserService.isValid($scope.email, $scope.password);

    if(res){
      ToastService.simpleToast('Welcome back ' + $scope.email + ' !');
    } else {
      ToastService.simpleToast('Wrong login/password');
    }
  };

  $scope.user = {
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryAdress: '',
    billingAdress: '',
    password: ''
  };

  // $scope.register = function(){
  //   if($scope.formRegister.$valid){
  //     ToastService.simpleToast('Welcome ' + $scope.user.email + ' !');
  //   } else {
  //     ToastService.simpleToast('The form is not valid, fields are missing');
  //   }
  // };

  $scope.check= function(model){
    if(model=='guest')
    {
      if($scope.guest=='guest')
      {
        $scope.new_customer=undefined;
        $scope.showRegisterForm=false;

      }
      else
      {
        $scope.new_customer='register';
      }
    }
    else
    {
      if($scope.new_customer=='register')
      {
        $scope.guest=undefined;
        $scope.showRegisterForm=true;
      }
      else
      {
        $scope.guest='guest';
      }

    }
  };

  $scope.showRegisterForm = false;
  $scope.toggleRegisterForm = function(){
    if($scope.guest=='guest')
    {
      ToastService.simpleToast('You can step in as a Guest now!');
    }
    else
    {
      $scope.showRegisterForm = true;
      if($scope.formRegister.$valid){
        ToastService.simpleToast('Welcome ' + $scope.user.email + ' !');
      } else {
        ToastService.simpleToast('The form is not valid, fields are missing');
      }
    }
  };

})

.controller('PanierController', function($scope, ArianeService, PanierController, sharedProperties){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Cart', '');
    $scope.lastProduct = sharedProperties.getLatestProductName();
    if(PanierController.get().length == 0)
    {
      $scope.showCartMessage = false;

    }
    else
    {
      $scope.showCartMessage = true;

    }

  var getTotalPrice = function(){
    var res = 0;

    $scope.items.map(function(i){
      res += i.price * Math.abs(i.quantity);
    });

    return res;
  };



  $scope.items = PanierController.get();


  $scope.isEmpty = function(){
    return $scope.items.length === 0;
  };

  $scope.remove = function(itemName){
    $scope.items = PanierController.remove(itemName).get();
    $scope.updateTotalPrice();
    if($scope.isEmpty)
    {
      $scope.showCartMessage = false;

    }
  };

  $scope.totalPrice = getTotalPrice();

  $scope.updateTotalPrice = function(){
    $scope.totalPrice = getTotalPrice();
  };

})

.controller('PresentationController', function($scope){

})

.controller('ArianeCtrl', function($scope, ArianeService){
  $scope.add = ArianeService.add;
  $scope.remove = ArianeService.remove;
  $scope.locations = ArianeService.get();

})

.controller('CategoryController', function($scope, CategoryService){
  $scope.showMe=false;
  $scope.categories = CategoryService.query();

  $scope.selectCategory = function(categoryName){
    CategoryService.setFilter(categoryName, $scope);

  };
})

.controller('SearchController', function($scope, SearchService){
  $scope.search = SearchService.getSearch();
  $scope.setSearch = SearchService.setSearch;
})

.controller('HeaderController', function($scope, PanierController){
  $scope.$watch(PanierController.get, function(oldValue, newValue){
      $scope.cartCount = PanierController.get().length;
  }, true);


})

//SERVICES SECTION////////////////////////////////////////////////////////////////////////////

.service('ArianeService', function(){
  var locations = [];

  return {
    add: function(name, url){
      locations.push({name: name, url: url});
      return this;
    },
    remove: function(){
      locations.pop();
      return this;
    },
    get: function(){
      return locations;
    },
    clear: function(){
      locations = [];
      return this;
    }
  };
})

.service('PanierController', function(){
  var items = [];

  function indexOfItem(name){
    var i = 0;
    while(i< items.length){
      if(items[i].name === name){
        return i;
      }
      i += 1;
    }
    return -1;
  }

  return {
    add: function(item, quantity){
      quantity = quantity || 1;
      item.quantity = quantity;

      var index = indexOfItem(item.name);

      if(index >= 0){
        items[index].quantity += quantity;
      } else {
        items.push(item);
      }

      return this;
    },
    remove: function(itemName){
      items = items.filter(function(item){
        return item.name !== itemName;
      });

      return this;
    },
    clear: function(){
      items = [];
      return this;
    },
    get: function(){
      return items;
    }
  };
})

.service('ToastService', function($mdToast){
  return {
    simpleToast: function(msg){
      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position('fit bottom right')
          .hideDelay(3000)
      );
    }
  };
})

.service('ItemService', function($resource, $filter, CategoryService, SearchService){
  var Item = $resource('resources/items.json');
  var items = Item.query();

  return {
    query: function(){
      var res = items;
      var categoryName = CategoryService.getFilter();
      var search = SearchService.getSearch();

      if(categoryName){
        res = res.filter(function(item){
          return item.category === categoryName;
        });
      }

      if(search){
        res = res.filter(function(item){
          return (item.name.indexOf(search) >= 0) ||
          (item.description.indexOf(search) >= 0);
        });
      }

      return res;
    }
  };
})

.service('CategoryService', function($resource){
  var Category = $resource('resources/categories.json');
  var filter = '';

  return {
    query: function(){
      return Category.query();
    },
    getFilter: function(){
      return filter;
    },
    setFilter: function(newFilter){
      filter = newFilter;
    }
  };
})

.service('SearchService', function(){
  var search = '';

  return {
    getSearch: function(){
      return search;
    },
    setSearch: function(newSearch){
      search = newSearch;
    }
  };
})

.service('UserService', function($resource){
  var User = $resource('resources/users.json');
  var users = User.query();

  return {
    query: function(){
      return users;
    },
    isValid: function(email, password){
      return users.some(function(u){
        return u.email === email &&
        u.password === password;
      });
    }
  };
})


.service('sharedProperties', function () {
        var latestProductAdded = '';

        return {
            getLatestProductName: function () {
                return latestProductAdded;
            },
            setLatestProductName: function(value) {
                latestProductAdded = value;
            }
        };
    })

.service('hide_ShowService', function () {
            var hide_show = 'Hide Option';

            return {
                getHide_ShowStatus: function () {
                    return hide_show;
                },
                setHide_ShowStatus: function(value) {
                  hide_show = value;
                }
            };
        });


;
