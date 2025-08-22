-- Create function to update budget spent amounts when transactions change
-- Run this in your Supabase SQL editor after running the basic schema

-- Function to recalculate spent amount for a specific budget category
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update spent amounts for affected categories
  -- This handles INSERT, UPDATE, and DELETE operations on transactions
  
  IF TG_OP = 'DELETE' THEN
    -- Update budget spent amount for the deleted transaction's category
    UPDATE budgets 
    SET spent_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions 
      WHERE user_id = OLD.user_id 
        AND category = OLD.category 
        AND type = 'expense'
    )
    WHERE user_id = OLD.user_id AND category = OLD.category;
    
    RETURN OLD;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Update spent amount for both old and new categories if category changed
    IF OLD.category != NEW.category OR OLD.type != NEW.type OR OLD.amount != NEW.amount THEN
      -- Update old category
      UPDATE budgets 
      SET spent_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions 
        WHERE user_id = OLD.user_id 
          AND category = OLD.category 
          AND type = 'expense'
      )
      WHERE user_id = OLD.user_id AND category = OLD.category;
      
      -- Update new category
      UPDATE budgets 
      SET spent_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions 
        WHERE user_id = NEW.user_id 
          AND category = NEW.category 
          AND type = 'expense'
      )
      WHERE user_id = NEW.user_id AND category = NEW.category;
    END IF;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    -- Update spent amount for the new transaction's category
    UPDATE budgets 
    SET spent_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions 
      WHERE user_id = NEW.user_id 
        AND category = NEW.category 
        AND type = 'expense'
    )
    WHERE user_id = NEW.user_id AND category = NEW.category;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update budget spent amounts
DROP TRIGGER IF EXISTS update_budget_spent_amount_trigger ON transactions;

CREATE TRIGGER update_budget_spent_amount_trigger
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spent_amount();

-- Function to initialize spent amounts for existing budgets
CREATE OR REPLACE FUNCTION initialize_budget_spent_amounts()
RETURNS void AS $$
BEGIN
  UPDATE budgets 
  SET spent_amount = (
    SELECT COALESCE(SUM(t.amount), 0)
    FROM transactions t
    WHERE t.user_id = budgets.user_id 
      AND t.category = budgets.category 
      AND t.type = 'expense'
  );
END;
$$ LANGUAGE plpgsql;

-- Run the initialization function to set current spent amounts
SELECT initialize_budget_spent_amounts();

-- Create a function that can be called to refresh all budget spent amounts manually
CREATE OR REPLACE FUNCTION refresh_all_budget_spent_amounts(target_user_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF target_user_id IS NULL THEN
    -- Refresh for all users
    UPDATE budgets 
    SET spent_amount = (
      SELECT COALESCE(SUM(t.amount), 0)
      FROM transactions t
      WHERE t.user_id = budgets.user_id 
        AND t.category = budgets.category 
        AND t.type = 'expense'
    );
  ELSE
    -- Refresh for specific user
    UPDATE budgets 
    SET spent_amount = (
      SELECT COALESCE(SUM(t.amount), 0)
      FROM transactions t
      WHERE t.user_id = budgets.user_id 
        AND t.category = budgets.category 
        AND t.type = 'expense'
    )
    WHERE user_id = target_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION refresh_all_budget_spent_amounts TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_budget_spent_amounts TO service_role;