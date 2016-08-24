function calculateDensity(){
    var iMass = $('input[name="mass"]').val();
    var iRadius = $('input[name="radius"]').val();
    var iEarthVolumes = Math.pow(iRadius, 3);
    var iDensity = iMass / iEarthVolumes;
    iDensity = Math.round(iDensity * 10000) / 10000;
    
    $('input[name="density"]').val(iDensity);
}


$('#mass-slider').slider({
    min: 0.01,
    max: 400,
    step: 0.1,
    value: 1,
    slide: function(event, ui){
        $('input[name="mass"]').val(ui.value);
        calculateDensity();
    }
});
$('input[name="mass"]').change(function(e){
    $('#mass-slider').slider('value', $(this).val());
    calculateDensity();
})
$('input[name="mass"]').val(1);

$('#radius-slider').slider({
    min: 0.2,
    max: 15,
    step: 0.1,
    value: 1,
    slide: function(event, ui){
        $('input[name="radius"]').val(ui.value);
        calculateDensity();
    }
})
$('input[name="radius"]').change(function(e){
    $('#radius-slider').slider('value', $(this).val());
    calculateDensity();
})
$('input[name="radius"]').val(1);

calculateDensity();