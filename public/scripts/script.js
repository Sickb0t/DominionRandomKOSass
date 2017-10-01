window.onload = function() {
    LoadInitialEventsCss();
};

function CardViewModel() {
    var self = this;
    var jsonCards = FetchCardsByJson();
    var filteredCards;
    var randomizedCard;

    jsonCards = _.sortBy(jsonCards.cards, 'name');

    self.includeAttack = 'Include attack cards ?';
    self.boxes = ['All', 'Base', 'Intrigue', 'Seaside', 'Alchemy', 'Prosperity', 'Cornucopia', 'Hinterlands', 'Dark Ages', 'Guilds', 'Adventures', 'Empires', 'Promo'];
    self.boxesRandom = ['Base', 'Intrigue', 'Seaside', 'Alchemy', 'Prosperity', 'Cornucopia', 'Hinterlands', 'Dark Ages', 'Guilds', 'Adventures', 'Empires', 'Promo'];
    self.card = ko.observableArray();
    self.randomizedCards = ko.observableArray();
    self.showBoxFilteredContent = function(box) { //Cards filtered by BUTTON click and box type
        jsonCards = FetchCardsByJson();
        filteredCards = box === 'All' ? jsonCards.cards : _.filter(jsonCards.cards, { 'box': box });
        filteredCards = _.sortBy(filteredCards, 'name');
        self.card(filteredCards);
    };
    self.showNameFilteredContent = function(event, data) { //Cards filtered by TEXTBOX on keyup
        var txtBoxValue = data.currentTarget.value;
        var cardsContainingValue = _.filter(filteredCards, function(item) {
            return item.name.toLowerCase().indexOf(txtBoxValue.toLowerCase()) !== -1;
        });

        var filteredCardsByKey = txtBoxValue === '' ? filteredCards : cardsContainingValue;
        self.card(filteredCardsByKey);
    };

    var nrOfCardsFromBox = ko.observableArray();

    self.sendCardsToRandomize = function(data) { // Cards to be randomized by randomize BUTTON click
        var test = nrOfCardsFromBox;
        var boxesChecked = [];
        var dictionaryOfBoxPreferences = [];
        var validCardCount = 0;
        var attackCards = document.getElementById('checkbox-attack').checked;

        $(':checkbox:checked').each(function(i) { // Check what boxes to include
            boxesChecked[i] = $(this).val();
        });

        $("input[class='input-fields']").map(function() { // Get minimum number of cards from each box that is to be included
            var boxName, nrOfCardsFromBox;
            boxName = $(this)[0].name;
            nrOfCardsFromBox = $(this).val() === '' ? '0' : $(this).val();
            if (boxesChecked.indexOf(boxName) !== -1) {
                dictionaryOfBoxPreferences.push({
                    key: boxName,
                    value: nrOfCardsFromBox
                });
            }
        });

        dictionaryOfBoxPreferences.forEach(function(card) {
            validCardCount = validCardCount + Number(card.value);
        });

        if (validCardCount <= 10) { //Make sure no more than 10 cards
            var cardsRandom = RandomizeCards(dictionaryOfBoxPreferences, jsonCards, attackCards, validCardCount);
            self.randomizedCards(cardsRandom);
        } else {
            alert('Count exceeded');
        }
    };

    filteredCards = jsonCards;
    self.card = ko.observableArray(jsonCards);
};
ko.applyBindings(new CardViewModel());

function testFun() {
    var a = null;
}

function RandomizeCards(dictionaryOfBoxPreferences, jsonCards, attackCards, validCardCount) {
    var cardsToReturn = [];
    var cardsToBePushed = [];
    var listBoxesNoNumber = [];

    var shuffled;

    if (!attackCards) {
        jsonCards = RemoveAttackCards(jsonCards);
    }

    if (dictionaryOfBoxPreferences.length !== 0) { // Check if specific number of cards from boxes
        dictionaryOfBoxPreferences.forEach(function(pref) {

            var filteredCards = _.filter(jsonCards, { 'box': pref.key });
            if (validCardCount === 0) {
                filteredCards.forEach(function(card) {
                    listBoxesNoNumber.push(card);
                });
                // cardsToBePushed = ShuffleAndSlice(filteredCards, shuffled, 10);
            } else {
                cardsToBePushed = ShuffleAndSlice(filteredCards, shuffled, pref.value);
            }
            if (validCardCount)
                cardsToBePushed.forEach(function(card) {
                    cardsToReturn.push(card);
                });
        });

        if (validCardCount === 0 && dictionaryOfBoxPreferences.length !== 0) {
            listBoxesNoNumber.forEach(function(card) {
                cardsToReturn.push(card);
            });
            cardsToReturn = ShuffleAndSlice(cardsToReturn, shuffled, 10);
        }

        if (cardsToReturn.length === 10) {
            return cardsToReturn;
        } else {
            var newJsonCards = [];
            var additionalSum = 10 - cardsToReturn.length;
            cardsToReturn.forEach(function(card) { //  Make sure no doubles
                if (newJsonCards.length === 0) {
                    newJsonCards = jsonCards.filter(function(c) {
                        return c.name !== card.name;
                    });
                } else {
                    newJsonCards = newJsonCards.filter(function(c) {
                        return c.name !== card.name;
                    });
                }
            });

            var additionalCards = ShuffleAndSlice(newJsonCards, shuffled, additionalSum);

            additionalCards.forEach(function(card) {
                cardsToReturn.push(card);
            });
            return cardsToReturn;
        }


    } else {
        cardsToReturn = ShuffleAndSlice(jsonCards, shuffled, 10);
        return cardsToReturn;
    }
};

function RemoveAttackCards(jsonCards) {
    var listWithoutAttack = [];
    jsonCards.forEach(function(card) {
        if (card.type.indexOf('Attack') === -1) {
            listWithoutAttack.push(card);
        }
    });
    return listWithoutAttack;
};

function ShuffleAndSlice(cardsIn, shuffled, nrOfCards) {
    shuffled = ShuffleArray(cardsIn);
    var returnThese = _.slice(shuffled, 0, nrOfCards);
    return returnThese;
};

function ShuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

function CheckCardType(type) {
    return type.indexOf('Attack') !== -1 ? 'red' : 'black';
};

function FetchCardsByJson() {
    var json = null;
    $.ajax({
        async: false,
        url: "public/content/cards.json",
        dataType: "json",
        success: function(data) {
            json = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('request failed: ' + errorThrown);
        }
    });
    return json;
};

function LoadInitialEventsCss() {
    $('.filter-holder li:first').addClass('active');
    $('.filter-holder li').on('click', function() { //Click event for box buttons    
        $('.filter-holder li').removeClass('active');
        $(this).addClass('active');
    });
};