import yaml
from logger_config import get_logger

logger = get_logger(__name__)

def load_config(file_path="config.yaml"):
    """Load configuration from a YAML file."""
    try:
        with open(file_path, "r") as file:
            config = yaml.safe_load(file)

        # Define required keys for validation
        required_sections = {
            "llm": ["api_key", "url"],
            "finnhub": ["api_key"],
            "router": ["quality_weight"]
        }

        # Validate the configuration
        errors = []
        for section, keys in required_sections.items():
            if section not in config:
                errors.append(f"Missing '{section}' section in config file.")
                continue

            for key in keys:
                if key not in config[section] or config[section][key] is None:
                    errors.append(f"Missing '{key}' in '{section}' section of config file.")

        if errors:
            for error in errors:
                logger.error(error)
            return None

        return config

    except FileNotFoundError:
        logger.error(f"Configuration file '{file_path}' not found.")
        return None

    except yaml.YAMLError as e:
        logger.error(f"Error parsing the configuration file: {e}")
        return None