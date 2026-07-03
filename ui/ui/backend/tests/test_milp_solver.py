
import pytest
from backend.solver.milp_scheduler import MILPScheduler
from backend.simulation.digital_twin import SAILTwin

def test_solver_simple_assignment():
    """Test that solver assigns a vessel to a valid berth."""
    # Setup simple state
    twin = SAILTwin()
    twin._create_default_state()
    state = twin.get_state()
    
    scheduler = MILPScheduler(timeout_seconds=10)
    result = scheduler.solve_scheduling(state)
    
    assert result['status'] in ['OPTIMAL', 'FEASIBLE']
    assignments = result['assignments']
    
    # Check V001 is assigned
    assert 'V001' in assignments['vessel_berth']
    # Check constraint: V001 (draft 14.0) fits in B1 (14.5) but not B2 (12.0)
    assert assignments['vessel_berth']['V001'] == 'B1'

def test_solver_no_solution():
    """Test solver failure when constraints are impossible."""
    twin = SAILTwin()
    twin._create_default_state()
    
    # Make vessel impossible to dock (draft too high for all berths)
    twin.vessels['V001'].draft = 20.0 
    
    scheduler = MILPScheduler()
    result = scheduler.solve_scheduling(twin.get_state())
    
    # Depending on objective, it might return feasible but with unassigned vessel (penalty)
    # Our current objective maximizes assignment, so V001 should NOT be in assignments
    assignments = result['assignments']
    assert 'V001' not in assignments['vessel_berth']

def test_rake_assignment_constraint():
    """Test that rakes are only assigned to berthed vessels."""
    twin = SAILTwin()
    twin._create_default_state()
    state = twin.get_state()
    
    scheduler = MILPScheduler()
    result = scheduler.solve_scheduling(state)
    
    v_assign = result['assignments']['vessel_berth']
    r_assign = result['assignments']['rake_vessel']
    
    for rake, vessel in r_assign.items():
        # Assert the vessel receiving the rake is actually berthed
        assert vessel in v_assign
