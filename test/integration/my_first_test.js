var webdriver = require('selenium-webdriver');
var assert = require('assert');
var chromeDriver = require('selenium-chromedriver');
var chrome = require('selenium-webdriver/chrome');
var port = process.env.__TEST_PORT;
var chromeOptions = new chrome.Options();

chromeOptions.setChromeBinaryPath(chromeDriver.path);

var proxy = require('selenium-webdriver/proxy');

var selectors = require('./selectors.json');
var hasClass = require('./util/has-class');
var filter = require('./util/filter');

describe('homepage', function() {
  var driver;

  beforeEach  (function() {
    var timeout = 5000;

    this.timeout(timeout);

    driver = new webdriver.Builder()
      .setChromeOptions(chromeOptions)
      .withCapabilities(webdriver.Capabilities.chrome())
      .setProxy(proxy.manual({ http: 'localhost:1337' }))
      .build();

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
});
