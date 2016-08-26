function calculateDensity(){
    var iMass = $('input[name="mass"]').val();
    var iRadius = $('input[name="radius"]').val();
    var iEarthVolumes = Math.pow(iRadius, 3);
    var iDensity = iMass / iEarthVolumes;
    iDensity = Math.round(iDensity * 10000) / 10000;
    
    $('input[name="density"]').val(iDensity);
}

function calculateOrbitalPeriod(){
    var iOrbitalRadius = $('input[name="orbital_radius"]').val();
    var iORbitalRadiusMeters = iOrbitalRadius * 149597871 * Math.pow(10, 3);
    var iStarMass = $('.star-mass').html();
    var iStarMassKg = iStarMass * 1.989 * Math.pow(10, 30); // kgs
    
    var gravConst = 6.674 * Math.pow(10, -11);
    
    var mu = gravConst * iStarMassKg;
    
    var iPeriodSeconds = 2 * Math.PI * Math.sqrt( Math.pow(iORbitalRadiusMeters, 3) / mu);
    var iPeriodDays = iPeriodSeconds / (3600 * 24);
    iPeriodDays = parseInt(iPeriodDays);
    
    $('input[name="orbital_period"]').val(iPeriodDays);
}

function calculateSurfaceGravity() {
    var iMass = $('input[name="mass"]').val();
    var iRadius = $('input[name="radius"]').val();
    
    var iPlanetMassKg = iMass * 5.972 * Math.pow(10, 24);
    var iPlanetRadiusMeters = iRadius * 6371 * Math.pow(10, 3);
    
    var gravConst = 6.674 * Math.pow(10, -11);
    
    var g = gravConst * iPlanetMassKg / Math.pow(iPlanetRadiusMeters, 2);
    
    g = Math.round(g * 100) / 100;
    
    $('input[name="surface_gravity"]').val(g);
}

function calculateEscapeVelocity(){
    var iMass = $('input[name="mass"]').val();
    var iRadius = $('input[name="radius"]').val();
    
    var gravConst = 6.674 * Math.pow(10, -11);
    var iMassKg = iMass * 5.972 * Math.pow(10, 24);
    var iRadiusMeters = iRadius * 6371 * Math.pow(10, 3);
    
    var iEscapeVelocity = Math.sqrt( (2 * gravConst * iMassKg) / iRadiusMeters );
    
    iEscapeVelocity /= 1000; // to km/s 
    iEscapeVelocity = Math.round(iEscapeVelocity * 100) / 100;
    
    $('input[name="escape_velocity"]').val(iEscapeVelocity);
}


$('#mass-slider').slider({
    min: 0.01,
    max: 400,
    step: 0.1,
    value: 1,
    slide: function(event, ui){
        $('input[name="mass"]').val(ui.value);
        calculateDensity();
        calculateSurfaceGravity();
        calculateEscapeVelocity();
    }
});
$('input[name="mass"]').change(function(e){
    $('#mass-slider').slider('value', $(this).val());
    calculateDensity();
    calculateSurfaceGravity();
    calculateEscapeVelocity();
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
        calculateSurfaceGravity();
        calculateEscapeVelocity();
    }
})
$('input[name="radius"]').change(function(e){
    $('#radius-slider').slider('value', $(this).val());
    calculateDensity();
    calculateSurfaceGravity();
    calculateEscapeVelocity();
})
$('input[name="radius"]').val(1);

$('#orbital-radius-slider').slider({
    min: 0.2,
    max: 40,
    step: 0.1,
    value: 1,
    slide: function(event, ui){
        $('input[name="orbital_radius"]').val(ui.value);
        calculateOrbitalPeriod();
    }
})
$('input[name="orbital_radius"]').change(function(e){
    $('#orbital-radius-slider').slider('value', $(this).val());
    calculateOrbitalPeriod();
})
$('input[name="orbital_radius"]').val(1);

calculateDensity();
calculateOrbitalPeriod();
calculateSurfaceGravity();
calculateEscapeVelocity();