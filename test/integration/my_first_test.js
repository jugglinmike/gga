var webdriver = require('selenium-webdriver');
var assert = require('assert');
var chromeDriver = require('selenium-chromedriver');
var chrome = require('selenium-webdriver/chrome');
var chromeService = new chrome.ServiceBuilder(chromeDriver.path);
var port = process.env.__TEST_PORT;

var selectors = require('./selectors.json');
var hasClass = require('./util/has-class');
var filter = require('./util/filter');

describe('homepage', function() {
  var driver;

  beforeEach  (function() {
    var timeout = 9000;

    this.timeout(timeout);

    driver = chrome.createDriver(null, chromeService.build());
    driver.get('http://localhost:' + port);
    driver.manage().timeouts().implicitlyWait(timeout);
    driver.implicitlyWait = timeout;

    return driver.wait(function() {
      return driver.isElementPresent(webdriver.By.css(selectors.homeHeader));
    }, 3000);
  });

  afterEach(function() {
    return driver.quit();
  });

  it('displays the header', function() {
    return driver.findElement(webdriver.By.css(selectors.homeHeader)).then(function(head) {
      return head.getText().then(function(headText) {
        assert.equal(headText, 'Georgia Legislative Navigator');
      });
    });
  });

  describe('members index', function() {

    beforeEach(function() {
      return driver.findElement(webdriver.By.css(selectors.nav.members))
        .then(function(membersElement) {
          return membersElement.click();
        })
        .then(function() {
          return driver.isElementPresent(webdriver.By.css(selectors.layouts.members.region));
        });
    });

    it('lists all members from both chambers when the user clicks on the "members" element', function() {
      return driver.findElements(webdriver.By.css(selectors.layouts.members.thumbnail))
        .then(function(memberEls) {
          assert.equal(memberEls.length, 236);
        });
    });

    describe('filtering', function() {
      this.timeout(8000);

      it('republicans', function() {
        return filter(driver, 'republicans').then(function(result) {
          assert.equal(result.republicans, 157);
          assert.equal(result.democrats, 0);
          assert.equal(result.independents, 0);
        });
      });

      it('democrats', function() {
        return filter(driver, 'democrats').then(function(result) {
          assert.equal(result.republicans, 0);
          assert.equal(result.democrats, 78);
          assert.equal(result.independents, 0);
        });
      });

      it('independents', function() {
        return filter(driver, 'independents').then(function(result) {
          assert.equal(result.republicans, 0);
          assert.equal(result.democrats, 0);
          assert.equal(result.independents, 1);
        });
      });

      it('democrats in the senate', function() {
        return filter(driver, 'senate').then(function() {
          return filter(driver, 'democrats');
        }).then(function(result) {
          assert.equal(result.republicans, 0);
          assert.equal(result.democrats, 18);
          assert.equal(result.independents, 0);
        });
      });

      it('republicans in the house', function() {
        return filter(driver, 'house').then(function() {
          return filter(driver, 'republicans');
        }).then(function(result) {
          assert.equal(result.republicans, 119);
          assert.equal(result.democrats, 0);
          assert.equal(result.independents, 0);
        });
      });
    });
  });

  describe('bills index', function() {

    beforeEach(function() {
      return driver.findElement(webdriver.By.css(selectors.nav.bills))
        .then(function(billsElement) {
          return billsElement.click();
        })
        .then(function() {
          return driver.isElementPresent(
            webdriver.By.css(selectors.layouts.bills.region)
          );
        });
    });

    describe.only('bill search', function() {
      var billId = '1151';
      var actionCount = 3;
      var primaryAuthor = 'Sam Moore';

      it('correctly returns requested house bill', function() {
        return driver.findElement(
          webdriver.By.css(selectors.layouts.bills.search.documentType)
        ).then(function(selectElement) {
          return selectElement.sendKeys('house bills');
        }).then(function() {
          return driver.findElement(
            webdriver.By.css(selectors.layouts.bills.search.billNumber)
          );
        }).then(function(numberInput) {
          return numberInput.sendKeys(billId)
            .then(function() {
              return numberInput.submit();
            });
        }).then(function() {
          return driver.wait(function() {
            return driver.isElementPresent(
              webdriver.By.css(selectors.layouts.bill.region)
            );
          }, 3000);
        }).then(function() {
          return driver.findElement(
            webdriver.By.css(selectors.layouts.bill.title)
          );
        }).then(function(element) {
          return element.getText();
        }).then(function(text) {
          assert(
            text.indexOf(billId) > -1, 'Expected bill ID present on page.'
          );
        });
      });

      it('does not return house bills when searching senate bills');
    });

    it('every category displays a positive number of watched bills', function() {
      var countRe = /\b(\d+)\s*bills?\b/i;

      return driver.findElements(
        webdriver.By.css(selectors.layouts.bills.categoryThumbnail)
      ).then(function(elements) {
        assert.equal(elements.length, 10);

        return webdriver.promise.all(elements.map(function(element) {
          return element.getText();
        })).then(function(texts) {
          texts.forEach(function(text) {
            var match = text.match(countRe);

            assert(match, 'Displays some number of bills');
            assert(parseInt(match[0], 10) > 0, 'Displays a positive number of bills');
          });
        });
      });
    });
  });
});
