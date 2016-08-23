
function expon(val){
    var minv = Math.log(gMinPrice);
    var maxv = Math.log(gMaxPrice);
    var scale = (maxv-minv) / (gMaxPrice-gMinPrice);
    return Math.exp(minv + scale*(val-gMinPrice));

}
function logposition(val){
    var minv = Math.log(gMinPrice);
    var maxv = Math.log(gMaxPrice);
    var scale = (maxv-minv) / (gMaxPrice-gMinPrice);
    return (Math.log(val)-minv) / scale + gMinPrice;
}

function calculateTemperature(){
    var iMass = $('input[name="mass"]').val();
    var iTemp = 5740 * Math.pow(iMass, 0.54);
    iTemp = Math.ceil(iTemp / 100) * 100;
    $('input[name="temperature"]').val(iTemp);
    calculateEstimate();
}

function calculateEstimate(){
    console.log('estimate?')
}

$('#mass-slider').slider({
    min: 0.1,
    max: 400,
    slide: function(event, ui){
        $('input[name="mass"]').val(Math.ceil(ui.value));
        calculateTemperature();
    }
});
$('input[name="mass"]').change(function(e){
    $('#mass-slider').slider('value', $(this).val());
    calculateTemperature();
})
$('input[name="mass"]').val(1);

$('#radius-slider').slider({
    min: 0.1,
    max: 2000,
    slide: function(event, ui){
        $('input[name="radius"]').val(Math.ceil(ui.value));
    }
})
$('input[name="radius"]').change(function(e){
    $('#radius-slider').slider('value', $(this).val());
})
$('input[name="radius"]').val(1);
