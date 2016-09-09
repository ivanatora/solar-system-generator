/* index */
function calculateTemperature(){
    var iMass = $('input[name="mass"]').val();
    var iTemp = 5740 * Math.pow(iMass, 0.54);
    iTemp = Math.ceil(iTemp / 100) * 100;
    
    if (iTemp > 30000){
        iTemp = Math.ceil(Math.random() * 10000 + 30000);
    }
    $('input[name="temperature"]').val(iTemp);
    calculateEstimate();
}

function calculateLumnosity(){
    var iMass = $('input[name="mass"]').val();
    var iLumnosity = 0;
    
    // equation according to https://en.wikipedia.org/wiki/Mass%E2%80%93luminosity_relation
    if (iMass <= 0.43){
        iLumnosity = 0.23 * Math.pow(iMass, 2.3);
    }
    else if (iMass > 0.43 && iMass <= 2){
        iLumnosity = Math.pow(iMass, 4);
    }
    else if (iMass > 2 && iMass <= 20){
        iLumnosity = 1.5 * Math.pow(iMass, 3.5)
    }
    else {
        iLumnosity = 3200 * iMass;
    }
    
    if (iLumnosity > 10){
        iLumnosity = Math.ceil(iLumnosity);
    }
    else {
        iLumnosity = Math.round(iLumnosity * 100) / 100;
    }
    
    $('input[name="lumnosity"]').val(iLumnosity);
    
    var iHabitableZoneStart = iLumnosity * 0.5;
    var iHabitableZoneEnd = iLumnosity * 3;
    $('input[name="habitable_zone_start"]').val(iHabitableZoneStart);
    $('input[name="habitable_zone_end"]').val(iHabitableZoneEnd);
    
    calculateEstimate();
}

function calculateDensity(){
    var iMass = $('input[name="mass"]').val();
    var iRadius = $('input[name="radius"]').val();
    var iSunVolumes = Math.pow(iRadius, 3);
    var iDensity = iMass / iSunVolumes;
    iDensity = Math.round(iDensity * 10000) / 10000;
    
    $('input[name="density"]').val(iDensity);
}

function calculateEscapeVelocity(){
    var iMass = $('input[name="mass"]').val();
    var iRadius = $('input[name="radius"]').val();
    
    var gravConst = 6.674 * Math.pow(10, -11);
    var iMassKg = iMass * 1.989 * Math.pow(10, 30); // kgs
    var iRadiusMeters = iRadius * 695700 * 1000;
    
    var iEscapeVelocity = Math.sqrt( (2 * gravConst * iMassKg) / iRadiusMeters );
    
    iEscapeVelocity /= 1000; // to km/s 
    iEscapeVelocity = Math.round(iEscapeVelocity / 100) * 100;
    
    $('input[name="escape_velocity"]').val(iEscapeVelocity);
}

function calculateEstimate(){
    var iMass = $('input[name="mass"]').val();
    var iTemperature = $('input[name="temperature"]').val();
    var iLumnosity = $('input[name="lumnosity"]').val();
    var iRadius = $('input[name="radius"]').val();
    
    var sEstimate = 'Unknown';
    
    // mass check
    if (iMass < 20){
        sEstimate = 'Main sequence';
        if (iTemperature < 3700){
            sEstimate = 'Class M (red)';
        }
        else if (iTemperature < 5200){
            sEstimate = 'Class K (orange)';
        }
        else if (iTemperature < 6000){
            sEstimate = 'Class G (yellow)';
        }
        else if (iTemperature < 7500){
            sEstimate = 'Class F (yellow white)';
        }
        else if (iTemperature < 10000){
            sEstimate = 'Class A (white)';
        }
        else if (iTemperature < 30000){
            sEstimate = 'Class B (blue white)';
        }
        else {
            sEstimate = 'Class O (blue)';
        }
    }
    
    // radius check
    if (sEstimate === 'Unknown' && iRadius > 10){
        sEstimate = 'Giant';
    }
    
    $('input[name="class"]').val(sEstimate);
}

// sliders

$('#mass-slider').slider({
    min: 0.1,
    max: 2,
    step: 0.1,
    value: 1,
    slide: function(event, ui){
        $('input[name="mass"]').val(ui.value);
        calculateTemperature();
        calculateLumnosity();
        calculateDensity();
        calculateEstimate();
        calculateEscapeVelocity();
    }
});
$('input[name="mass"]').change(function(e){
    $('#mass-slider').slider('value', $(this).val());
    calculateTemperature();
    calculateLumnosity();
    calculateDensity();
    calculateEstimate();
    calculateEscapeVelocity();
})
$('input[name="mass"]').val(1);

$('#radius-slider').slider({
    min: 0.5,
    max: 1.5,
    step: 0.1,
    value: 1,
    slide: function(event, ui){
        $('input[name="radius"]').val(ui.value);
        calculateEstimate();
        calculateDensity();
        calculateEscapeVelocity();
    }
})
$('input[name="radius"]').change(function(e){
    $('#radius-slider').slider('value', $(this).val());
    calculateEstimate();
    calculateDensity();
    calculateEscapeVelocity();
})
$('input[name="radius"]').val(1);


calculateTemperature();
calculateLumnosity();
calculateDensity();
calculateEstimate();
calculateEscapeVelocity();

